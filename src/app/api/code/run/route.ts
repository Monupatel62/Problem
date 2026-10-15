import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { getJudgeServiceConfig } from "@/lib/problems/judge-service-config";

export const runtime = "nodejs";
export const maxDuration = 65; // seconds — allow full Render cold-start time

const ALLOWED_LANGUAGES = new Set([
  "JavaScript",
  "TypeScript",
  "Python",
  "C++",
  "C",
  "Java",
  "Go",
  "Rust",
  "Kotlin",
  "Ruby",
  "PHP",
  "C#",
  "SQL",
  "Bash",
]);

const MAX_CODE = Number(process.env.JUDGE_MAX_CODE_LENGTH || 50_000);
const TIMEOUT_MS = Number(process.env.JUDGE_SERVICE_TIMEOUT_MS || 65_000);  // 65s — covers Render free-tier cold start
const JS_TIMEOUT_MS = Number(process.env.JUDGE_JS_TIMEOUT_MS || 1_000);
const MAX_STDOUT = Number(process.env.JUDGE_MAX_STDIO_LENGTH || 50_000);
const MAX_STDERR = 5_000;
const LOCAL_RUN_TIMEOUT_MS = Number(process.env.JUDGE_LOCAL_RUN_TIMEOUT_MS || 3_000);
const LOCAL_COMPILE_TIMEOUT_MS = Number(process.env.JUDGE_LOCAL_COMPILE_TIMEOUT_MS || 8_000);
const MAX_CONCURRENT_RUNS = Number(process.env.JUDGE_MAX_CONCURRENT_RUNS || 3);

let activeRuns = 0;

const forbiddenPatterns: Record<string, Array<{ pattern: RegExp; label: string }>> = {
  JavaScript: [
    { pattern: /\b(?:process|require|global|globalThis|Function|eval|WebAssembly)\b/, label: "server/runtime access" },
    { pattern: /\b(?:fetch|XMLHttpRequest|Worker|import\s*\()\b/, label: "network or dynamic loading" },
  ],
  TypeScript: [
    { pattern: /\b(?:process|require|global|globalThis|Function|eval|WebAssembly)\b/, label: "server/runtime access" },
    { pattern: /\b(?:fetch|XMLHttpRequest|Worker|import\s*\()\b/, label: "network or dynamic loading" },
  ],
  Python: [
    { pattern: /\b(?:import|from)\s+(?:os|sys|subprocess|socket|pathlib|shutil|multiprocessing|threading|ctypes|resource|signal|requests|urllib|http|ftplib|smtplib)\b/, label: "unsafe module import" },
    { pattern: /\b(?:__import__|eval|exec|open|compile|input|globals|locals|vars)\s*\(/, label: "unsafe builtin" },
  ],
  "C++": [
    { pattern: /^\s*#\s*include\s*[<"](?:filesystem|fstream|unistd\.h|windows\.h|sys\/|pthread\.h|thread|future|process\.h)/m, label: "filesystem/process/thread header" },
    { pattern: /\b(?:system|popen|fork|exec\w*|CreateProcess|WinExec|ShellExecute|remove|rename|freopen|ofstream|ifstream|fstream)\s*\(/, label: "filesystem/process API" },
  ],
  C: [
    { pattern: /^\s*#\s*include\s*[<"](?:unistd\.h|windows\.h|sys\/|pthread\.h|process\.h|dirent\.h)/m, label: "filesystem/process/thread header" },
    { pattern: /\b(?:system|popen|fork|exec\w*|CreateProcess|WinExec|ShellExecute|remove|rename|freopen|fopen|fwrite)\s*\(/, label: "filesystem/process API" },
  ],
  Java: [
    { pattern: /\b(?:Runtime|ProcessBuilder|System\.exit|ClassLoader|Class\.forName|java\.io|java\.nio|java\.net|java\.lang\.reflect|java\.util\.concurrent|Thread)\b/, label: "filesystem/network/process/thread API" },
  ],
  Go: [
    { pattern: /\b(?:os\/exec|syscall|net\/http|net\/)\b/, label: "process/network access" },
    { pattern: /"\s*(?:os\/exec|syscall|net\/http|net)\s*"/, label: "unsafe package import" },
  ],
  Rust: [
    { pattern: /\b(?:std::process|std::fs|std::net)\b/, label: "process/filesystem/network access" },
    { pattern: /\b(?:Command|process::exit)\b/, label: "process execution" },
  ],
  Kotlin: [
    { pattern: /\b(?:Runtime|ProcessBuilder|java\.io|java\.net|java\.nio)\b/, label: "filesystem/network/process API" },
    { pattern: /\b(?:System\.exit|ClassLoader|Class\.forName)\b/, label: "unsafe system access" },
  ],
  Ruby: [
    { pattern: /\b(?:system|exec|spawn)\s*[\("]/, label: "process execution" },
    { pattern: /`[^`]+`/, label: "backtick command execution" },
    { pattern: /\b(?:IO|File|Dir|Net|Socket|TCPSocket|UDPSocket|Open3)\b/, label: "filesystem/network access" },
  ],
  PHP: [
    { pattern: /\b(?:exec|system|shell_exec|passthru|proc_open|popen)\s*\(/, label: "process execution" },
    { pattern: /\b(?:file_get_contents|fopen|fwrite|file_put_contents|curl_init|curl_exec)\s*\(/, label: "filesystem/network access" },
    { pattern: /\b(?:eval|assert|preg_replace)\s*\(.*\/[a-z]*e/, label: "code execution" },
  ],
  "C#": [
    { pattern: /\b(?:System\.Diagnostics|System\.IO|System\.Net)\b/, label: "process/filesystem/network access" },
    { pattern: /\b(?:Process|ProcessStartInfo|WebClient|HttpClient)\b/, label: "process/network execution" },
  ],
  SQL: [
    { pattern: /\b(?:DROP\s+(?:DATABASE|SCHEMA)|GRANT|REVOKE|EXEC\s|EXECUTE\s)\b/i, label: "admin/privilege operation" },
  ],
  Bash: [
    { pattern: /\b(?:rm\s+-rf|dd\s+if=|mkfs|format|fdisk)\b/, label: "destructive filesystem operation" },
    { pattern: /\b(?:curl|wget|nc\s|ncat|netcat|ssh\s|scp\s|sftp|ftp\s)\b/, label: "network access" },
    { pattern: /\b(?:sudo|su|chmod|chown|kill|killall|pkill)\b/, label: "privilege escalation/process control" },
  ],
};

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// Filter known harmless runtime warnings from stderr
const NOISE_PATTERNS = [
  /OpenJDK.*-Xverify:none.*deprecated.*\n?/gi,
  /OpenJDK.*-noverify.*deprecated.*\n?/gi,
  /WARNING:.*illegal reflective access.*\n?/gi,
  /WARNING:.*An illegal reflective access operation has occurred.*\n?/gi,
  /NOTE:.*uses or overrides a deprecated API.*\n?/gi,
];
function cleanStderr(raw: string): string {
  let cleaned = raw;
  for (const pat of NOISE_PATTERNS) cleaned = cleaned.replace(pat, "");
  return cleaned.trim();
}

function rejectUnsafeCode(language: string, code: string) {
  const checks = forbiddenPatterns[language] ?? [];
  const hit = checks.find((check) => check.pattern.test(code));
  if (!hit) return null;
  return {
    stdout: "",
    stderr: `Blocked unsafe code: ${hit.label}. This online runner only allows simple learning examples and prevents code that could affect the WoHoTech server.`,
    runtimeMs: 0,
    exitCode: 1,
  };
}

async function withExecutionSlot<T>(action: () => Promise<T>) {
  if (activeRuns >= MAX_CONCURRENT_RUNS) {
    return {
      stdout: "",
      stderr: "Runner is busy. Please try again in a few seconds.",
      runtimeMs: 0,
      exitCode: 1,
    } as T;
  }

  activeRuns += 1;
  try {
    return await action();
  } finally {
    activeRuns = Math.max(0, activeRuns - 1);
  }
}

function stringifyConsoleArg(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "undefined") return "undefined";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function runJavaScriptLocally(code: string) {
  const started = Date.now();
  const stdout: string[] = [];
  const stderr: string[] = [];

  const context = vm.createContext({
    console: {
      log: (...args: unknown[]) => stdout.push(args.map(stringifyConsoleArg).join(" ")),
      info: (...args: unknown[]) => stdout.push(args.map(stringifyConsoleArg).join(" ")),
      warn: (...args: unknown[]) => stderr.push(args.map(stringifyConsoleArg).join(" ")),
      error: (...args: unknown[]) => stderr.push(args.map(stringifyConsoleArg).join(" ")),
    },
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    BigInt,
    Date,
    RegExp,
    Set,
    Map,
    WeakSet,
    WeakMap,
    Promise,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    undefined,
  });

  try {
    new vm.Script(`"use strict";\n${code}`).runInContext(context, { timeout: JS_TIMEOUT_MS });
    return {
      stdout: stdout.join("\n").slice(0, MAX_STDOUT),
      stderr: stderr.join("\n").slice(0, MAX_STDERR),
      runtimeMs: Math.max(1, Date.now() - started),
      exitCode: 0,
    };
  } catch (error) {
    return {
      stdout: stdout.join("\n").slice(0, MAX_STDOUT),
      stderr: (error instanceof Error ? error.message : "Runtime error.").slice(0, MAX_STDERR),
      runtimeMs: Math.max(1, Date.now() - started),
      exitCode: 1,
    };
  }
}

type CommandResult = {
  stdout: string;
  stderr: string;
  runtimeMs: number;
  exitCode: number;
  timedOut?: boolean;
  missingExecutable?: boolean;
};

function killProcessTree(pid?: number) {
  if (!pid) return;

  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(pid), "/T", "/F"], {
      shell: false,
      windowsHide: true,
      stdio: "ignore",
    });
    killer.on("error", () => {});
    return;
  }

  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // Process may have already exited.
    }
  }
}

function runCommand(command: string, args: string[], cwd: string, timeoutMs: number): Promise<CommandResult> {
  const started = Date.now();

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;
    let killedForOutput = false;

    const child = spawn(command, args, {
      cwd,
      detached: process.platform !== "win32",
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let timer: ReturnType<typeof setTimeout>;

    const finish = (result: Omit<CommandResult, "runtimeMs">) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        ...result,
        stdout: result.stdout.slice(0, MAX_STDOUT),
        stderr: cleanStderr(result.stderr).slice(0, MAX_STDERR),
        runtimeMs: Math.max(1, Date.now() - started),
      });
    };

    timer = setTimeout(() => {
      timedOut = true;
      killProcessTree(child.pid);
    }, timeoutMs);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > MAX_STDOUT) {
        killedForOutput = true;
        killProcessTree(child.pid);
      }
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
      if (stderr.length > MAX_STDERR) {
        killedForOutput = true;
        killProcessTree(child.pid);
      }
    });

    child.on("error", (error: NodeJS.ErrnoException) => {
      finish({
        stdout,
        stderr: error.code === "ENOENT"
          ? `${command} is not installed or not available in PATH.`
          : error.message,
        exitCode: 1,
        missingExecutable: error.code === "ENOENT",
      });
    });

    child.on("close", (code) => {
      finish({
        stdout,
        stderr: timedOut
          ? `Execution timed out after ${timeoutMs} ms.`
          : killedForOutput
            ? "Execution stopped because output was too large."
            : stderr,
        exitCode: timedOut || killedForOutput ? 124 : Number(code ?? 0),
        timedOut,
      });
    });
  });
}

async function withTempDir<T>(prefix: string, action: (dir: string) => Promise<T>) {
  // Use os.tmpdir() so Turbopack doesn't trace broad file patterns from process.cwd()
  const baseDir = process.env.JUDGE_LOCAL_WORKDIR || path.join(os.tmpdir(), "wohotech-judge");
  await mkdir(baseDir, { recursive: true });
  const dir = await mkdtemp(path.join(baseDir, prefix));
  try {
    return await action(dir);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

function createSafePythonCode(code: string) {
  return `
import builtins

_real_import = builtins.__import__
_blocked_modules = {
    "os", "sys", "subprocess", "socket", "pathlib", "shutil", "multiprocessing",
    "threading", "ctypes", "resource", "signal", "requests", "urllib", "http",
    "ftplib", "smtplib", "asyncio"
}
_blocked_builtins = {"open", "eval", "exec", "compile", "input", "__import__"}

def _safe_import(name, *args, **kwargs):
    root = str(name).split(".")[0]
    if root in _blocked_modules:
        raise ImportError(f"Module '{root}' is blocked in the WoHoTech runner.")
    return _real_import(name, *args, **kwargs)

builtins.__import__ = _safe_import
for _name in _blocked_builtins:
    if hasattr(builtins, _name):
        setattr(builtins, _name, lambda *args, **kwargs: (_ for _ in ()).throw(PermissionError("Unsafe builtin is blocked in the WoHoTech runner.")))

${code}
`;
}

async function runPythonLocally(code: string) {
  return withTempDir("wohotech-code-py-", async (dir) => {
    await writeFile(path.join(dir, "main.py"), createSafePythonCode(code), "utf8");
    const pythonCommand = process.env.JUDGE_PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");
    return runCommand(pythonCommand, ["-I", "main.py"], dir, LOCAL_RUN_TIMEOUT_MS);
  });
}

async function runCppLocally(code: string) {
  return withTempDir("wohotech-code-cpp-", async (dir) => {
    const source = path.join(dir, "main.cpp");
    const output = process.platform === "win32" ? "main.exe" : "main";
    await writeFile(source, code, "utf8");

    const compiler = process.env.JUDGE_CPP_BIN || "g++";
    const compile = await runCommand(
      compiler,
      ["-std=c++17", "-O2", "-pipe", "main.cpp", "-o", output],
      dir,
      LOCAL_COMPILE_TIMEOUT_MS,
    );
    if (compile.exitCode !== 0) return compile;

    return runCommand(path.join(dir, output), [], dir, LOCAL_RUN_TIMEOUT_MS);
  });
}

async function runCppInDocker(code: string) {
  if (process.env.JUDGE_DOCKER_ENABLED !== "true") {
    return {
      stdout: "",
      stderr:
        "C++ compiler is not installed on this server. Install g++ and set JUDGE_CPP_BIN, or set JUDGE_DOCKER_ENABLED=true on a Docker-capable server.",
      runtimeMs: 0,
      exitCode: 1,
      missingExecutable: true,
    };
  }

  return withTempDir("wohotech-code-cpp-docker-", async (dir) => {
    await writeFile(path.join(dir, "main.cpp"), code, "utf8");
    const image = process.env.JUDGE_CPP_IMAGE || "gcc:13";
    return runCommand(
      "docker",
      [
        "run",
        "--rm",
        "--network",
        "none",
        "--cpus",
        "0.5",
        "--memory",
        "256m",
        "--pids-limit",
        "64",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges",
        "-v",
        `${dir}:/work`,
        "-w",
        "/work",
        image,
        "bash",
        "-lc",
        "g++ -std=c++17 -O2 -pipe main.cpp -o main && timeout 3s ./main",
      ],
      dir,
      Math.max(LOCAL_COMPILE_TIMEOUT_MS, LOCAL_RUN_TIMEOUT_MS) + 2_000,
    );
  });
}

async function runJavaLocally(code: string) {
  return withTempDir("wohotech-code-java-", async (dir) => {
    await writeFile(path.join(dir, "Main.java"), code, "utf8");

    const javac = process.env.JUDGE_JAVAC_BIN || "javac";
    const java = process.env.JUDGE_JAVA_BIN || "java";
    const compile = await runCommand(javac, ["Main.java"], dir, LOCAL_COMPILE_TIMEOUT_MS);
    if (compile.exitCode !== 0) return compile;

    return runCommand(java, ["-cp", dir, "Main"], dir, LOCAL_RUN_TIMEOUT_MS);
  });
}

// â”€â”€â”€ Judge0 CE fallback (free public, supports many languages) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const JUDGE0_LANG_ID: Record<string, number> = {
  "C++":        54,
  "C":          50,
  "Java":       62,
  "Python":     71,
  "TypeScript": 74,
  "Go":         60,
  "Rust":       73,
  "Kotlin":     78,
  "Ruby":       72,
  "PHP":        68,
  "C#":         51,
  "SQL":        82,
  "Bash":       46,
};

async function runViaJudge0(language: string, code: string): Promise<CommandResult> {
  const langId = JUDGE0_LANG_ID[language];
  if (!langId) {
    return { stdout: "", stderr: `Judge0: unsupported language ${language}`, runtimeMs: 0, exitCode: 1 };
  }

  // RapidAPI key takes priority over free public endpoint
  const rapidApiKey = process.env.JUDGE0_API_KEY?.trim();
  const rapidApiHost = process.env.JUDGE0_HOST?.trim() || "judge0-ce.p.rapidapi.com";
  const useRapidApi = !!rapidApiKey;
  const j0Url = useRapidApi ? "https://" + rapidApiHost + "/submissions?base64_encoded=false&wait=true" : "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";
  const j0H: Record<string,string> = { "Content-Type": "application/json" };
  if (useRapidApi) { j0H["X-RapidAPI-Key"]=rapidApiKey!; j0H["X-RapidAPI-Host"]=rapidApiHost; }
  const started = Date.now();
  try {
    const res = await fetch(j0Url, {
      method: "POST",
      headers: j0H,
      body: JSON.stringify({ language_id: langId, source_code: code, stdin: "" }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      return { stdout: "", stderr: `Judge0 API error: HTTP ${res.status}`, runtimeMs: Date.now() - started, exitCode: 1 };
    }

    // Guard against empty / non-JSON responses from Judge0
    const rawText = await res.text();
    if (!rawText || !rawText.trim()) {
      return { stdout: "", stderr: "Judge0 returned an empty response. The service may be overloaded. Please try again.", runtimeMs: Date.now() - started, exitCode: 1 };
    }

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      return { stdout: "", stderr: "Judge0 returned an invalid response. Please try again in a moment.", runtimeMs: Date.now() - started, exitCode: 1 };
    }
    const isError = data.status?.id >= 6; // 6+ = error statuses in Judge0
    const compileErr = data.compile_output ?? "";
    const runtimeErr = data.stderr ?? "";
    const stdoutOut = data.stdout ?? "";
    const exitCode = isError ? 1 : 0;

    return {
      stdout: stdoutOut.slice(0, MAX_STDOUT),
      stderr: cleanStderr(compileErr || runtimeErr).slice(0, MAX_STDERR),
      runtimeMs: Math.round((data.time ?? 0) * 1000) || (Date.now() - started),
      exitCode,
    };
  } catch (e) {
    return {
      stdout: "",
      stderr: e instanceof Error ? e.message : "Judge0 API unreachable",
      runtimeMs: Date.now() - started,
      exitCode: 1,
    };
  }
}

async function runViaRenderJudge(language: string, code: string): Promise<CommandResult | null> {
  const serviceConfig = getJudgeServiceConfig();
  if (!serviceConfig.enabled) return null;

  const started = Date.now();
  try {
    // Use /judge with isFreeRun:true â€” no test cases, just stdout/stderr output
    const res = await fetch(`${serviceConfig.url}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.JUDGE_SERVICE_TOKEN
          ? { Authorization: `Bearer ${process.env.JUDGE_SERVICE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ language, code }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return null;

    // Guard against empty / non-JSON responses from Render judge
    const rawText = await res.text();
    if (!rawText || !rawText.trim()) return null;
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      return null;
    }
    return {
      stdout: String(data.stdout ?? "").slice(0, MAX_STDOUT),
      stderr: cleanStderr(String(data.stderr ?? "")).slice(0, MAX_STDERR),
      runtimeMs: Number(data.runtimeMs ?? Date.now() - started),
      exitCode: Number(data.exitCode ?? (data.stderr ? 1 : 0)),
    };
  } catch {
    return null;
  }
}

async function runLocally(language: string, code: string) {
  // JavaScript runs locally via vm sandbox (always available)
  if (language === "JavaScript") return runJavaScriptLocally(code);

  // TypeScript: strip type annotations and run as JS locally, or fall through to external judge
  if (language === "TypeScript") {
    // Try external judge first since TS needs compilation
    const renderResult = await runViaRenderJudge("TypeScript", code);
    if (renderResult) return renderResult;
    return runViaJudge0("TypeScript", code);
  }

  if (language === "Python") {
    const local = await runPythonLocally(code);
    if (!local.missingExecutable) return local;
    return (await runViaRenderJudge("Python", code)) ?? runViaJudge0("Python", code);
  }

  if (language === "C++") {
    const local = await runCppLocally(code);
    if (!local.missingExecutable) return local;
    return (await runViaRenderJudge("C++", code)) ?? runViaJudge0("C++", code);
  }

  if (language === "C") {
    // Try local gcc compilation
    const local = await withTempDir("wohotech-code-c-", async (dir) => {
      const source = path.join(dir, "main.c");
      const output = process.platform === "win32" ? "main.exe" : "main";
      await writeFile(source, code, "utf8");
      const compiler = process.env.JUDGE_CC_BIN || "gcc";
      const compile = await runCommand(compiler, ["-std=c11", "-O2", "-pipe", "main.c", "-o", output], dir, LOCAL_COMPILE_TIMEOUT_MS);
      if (compile.exitCode !== 0) return compile;
      return runCommand(path.join(dir, output), [], dir, LOCAL_RUN_TIMEOUT_MS);
    });
    if (!local.missingExecutable) return local;
    return (await runViaRenderJudge("C", code)) ?? runViaJudge0("C", code);
  }

  if (language === "Java") {
    const local = await runJavaLocally(code);
    if (!local.missingExecutable) return local;
    return (await runViaRenderJudge("Java", code)) ?? runViaJudge0("Java", code);
  }

  // Languages that require external judge (no local compilation available typically)
  if (language === "Go" || language === "Rust" || language === "Kotlin" ||
      language === "Ruby" || language === "PHP" || language === "C#" ||
      language === "SQL" || language === "Bash") {
    const renderResult = await runViaRenderJudge(language, code);
    if (renderResult) return renderResult;
    return runViaJudge0(language, code);
  }

  return null;
}

export async function POST(request: Request) {
  // Size guard
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 500_000) return json({ error: "Payload too large." }, 413);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  if (!body || typeof body !== "object") return json({ error: "Invalid request body." }, 400);

  const language = String((body as any).language ?? "JavaScript");
  const code     = String((body as any).code ?? "");

  if (!ALLOWED_LANGUAGES.has(language))
    return json({ error: `Language '${language}' is not supported. Supported: ${[...ALLOWED_LANGUAGES].join(", ")}.` }, 400);

  if (!code.trim())
    return json({ stdout: "", stderr: "", runtimeMs: 0, exitCode: 0, message: "Empty code." });

  if (code.length > MAX_CODE)
    return json({ stdout: "", stderr: `Code is too large. Maximum is ${MAX_CODE} characters.`, runtimeMs: 0, exitCode: 1 });

  const unsafeResult = rejectUnsafeCode(language, code);
  if (unsafeResult) return json(unsafeResult);

  const localResult = (await withExecutionSlot(() => runLocally(language, code))) as CommandResult | null;
  if (localResult) {
    return json(localResult);
  }

  // Forward to external judge service (fallback - rarely reached now)
  const serviceConfig = getJudgeServiceConfig();
  if (!serviceConfig.enabled) {
    return json({
      stdout: "",
      stderr: "Code execution service is not configured. Contact support.",
      runtimeMs: 0,
      exitCode: 1,
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${serviceConfig.url}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.JUDGE_SERVICE_TOKEN
          ? { Authorization: `Bearer ${process.env.JUDGE_SERVICE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        language,
        code,
        isFreeRun: true,
        functionName: "__free_run__",
        cases: [],
        mode: "run",
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return json({
        stdout: "",
        stderr: `Judge service returned HTTP ${response.status}.`,
        runtimeMs: 0,
        exitCode: 1,
      });
    }

    // Guard against empty / non-JSON from external judge service
    const rawText = await response.text();
    if (!rawText || !rawText.trim()) {
      return json({ stdout: "", stderr: "Judge service returned an empty response.", runtimeMs: 0, exitCode: 1 });
    }
    let result: any;
    try {
      result = JSON.parse(rawText);
    } catch {
      return json({ stdout: "", stderr: "Judge service returned an invalid response.", runtimeMs: 0, exitCode: 1 });
    }

    return json({
      stdout:    String(result.stdout    ?? result.message ?? ""),
      stderr:    String(result.stderr    ?? ""),
      runtimeMs: Number(result.runtimeMs ?? 0),
      exitCode:  result.exitCode !== undefined
        ? Number(result.exitCode)
        : result.status === "Compilation Error" || result.status === "Runtime Error"
          ? 1
          : 0,
    });
  } catch (error) {
    if ((error as any)?.name === "AbortError") {
      return json({ stdout: "", stderr: "Request timed out.", runtimeMs: TIMEOUT_MS, exitCode: 124 });
    }
    return json({
      stdout: "",
      stderr: error instanceof Error ? error.message : "Code execution service unavailable.",
      runtimeMs: 0,
      exitCode: 1,
    });
  } finally {
    clearTimeout(timeout);
  }
}
