import vm from "node:vm";
import type { ProblemCase } from "@/lib/problems/bank";
import {
  createCppHarness,
  createJavaHarness,
  createPythonHarness,
  runCppInDocker,
  runJavaInDocker,
  runPythonInDocker,
} from "@/lib/problems/docker-runner";
import { getJudgeServiceConfig } from "@/lib/problems/judge-service-config";
import { getProblem, saveProblemSubmission } from "@/lib/problems/service";

export type JudgeMode = "run" | "submit";

export type ServerJudgeInput = {
  slug: string;
  userId?: string | null;
  language: string;
  code: string;
  mode: JudgeMode;
  sampleIndexes?: number[];
  customCases?: ProblemCase[];
  isSql?: boolean;
  isShell?: boolean;
  isConcurrency?: boolean;
};

export type ServerJudgeResult = {
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" | "Idle";
  passed: number;
  total: number;
  runtimeMs: number;
  memoryMb: number;
  message: string;
  failedCase?: {
    input: unknown[];
    expected: unknown;
    actual?: unknown;
  };
  testResults?: Array<{
    caseNumber: number;
    status: "Accepted" | "Wrong Answer" | "Runtime Error";
    input: unknown[];
    expected: unknown;
    actual?: unknown;
    runtimeMs: number;
    memoryMb: number;
    message?: string;
  }>;
  persisted: boolean;
  persistenceMode: "database" | "local";
  submissionId?: string;
};

type LocalJudgeResult = Omit<ServerJudgeResult, "persisted" | "persistenceMode" | "submissionId">;

const MAX_CODE_LENGTH = 50_000;
const EXECUTION_TIMEOUT_MS = 900;
const JUDGE_SERVICE_TIMEOUT_MS = Number(process.env.JUDGE_SERVICE_TIMEOUT_MS || 10_000);
const JUDGE0_FALLBACK_ENABLED = process.env.JUDGE0_FALLBACK_DISABLED !== "true";
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  Python: 71,
  "C++": 54,
  Java: 62,
};

function currentMemoryMb() {
  return Math.max(0, process.memoryUsage().heapUsed / 1024 / 1024);
}

function measuredMemoryMb(startMemoryMb: number) {
  const current = currentMemoryMb();
  return Number(Math.max(current, startMemoryMb).toFixed(1));
}

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (typeof value === "number") return Number.isFinite(value) ? value : String(value);
  return value;
}

function sameAnswer(actual: unknown, expected: unknown): boolean {
  if (typeof actual === "number" && typeof expected === "number") {
    return Math.abs(actual - expected) <= 1e-9;
  }
  if (typeof actual === "string" && typeof expected === "number" && actual.trim() !== "" && Number.isFinite(Number(actual))) {
    return Math.abs(Number(actual) - expected) <= 1e-9;
  }
  if (typeof actual === "number" && typeof expected === "string" && expected.trim() !== "" && Number.isFinite(Number(expected))) {
    return Math.abs(actual - Number(expected)) <= 1e-9;
  }
  if (Array.isArray(actual) && Array.isArray(expected)) {
    return actual.length === expected.length && actual.every((value, index) => sameAnswer(value, expected[index]));
  }
  return JSON.stringify(normalizeValue(actual)) === JSON.stringify(normalizeValue(expected));
}

function cloneInput(input: unknown[]) {
  return input.map((value) => {
    if (Array.isArray(value) || (value && typeof value === "object")) {
      return JSON.parse(JSON.stringify(value));
    }
    return value;
  });
}

function createCompilationResult(message: string, total: number): ServerJudgeResult {
  return {
    status: "Compilation Error",
    passed: 0,
    total,
    runtimeMs: 0,
    memoryMb: 0,
    message,
    persisted: false,
    persistenceMode: "local",
  };
}

function runJavaScript(code: string, cases: ProblemCase[], functionName: string): LocalJudgeResult {
  const startMemoryMb = currentMemoryMb();

  if (code.length > MAX_CODE_LENGTH) {
    return {
      status: "Compilation Error",
      passed: 0,
      total: cases.length,
      runtimeMs: 0,
      memoryMb: measuredMemoryMb(startMemoryMb),
      message: `Code is too large. Limit is ${MAX_CODE_LENGTH} characters.`,
    };
  }

  const started = Date.now();
  const context = vm.createContext({});
  let solution: unknown;

  try {
    const script = new vm.Script(`
      "use strict";
      ${code}
      ;typeof ${functionName} === "function" ? ${functionName} : undefined;
    `);
    solution = script.runInContext(context, { timeout: EXECUTION_TIMEOUT_MS });
  } catch (error) {
    return {
      status: "Compilation Error",
      passed: 0,
      total: cases.length,
      runtimeMs: Math.max(1, Date.now() - started),
      memoryMb: measuredMemoryMb(startMemoryMb),
      message: error instanceof Error ? error.message : "Unable to compile code.",
    };
  }

  if (typeof solution !== "function") {
    return {
      status: "Compilation Error",
      passed: 0,
      total: cases.length,
      runtimeMs: Math.max(1, Date.now() - started),
      memoryMb: measuredMemoryMb(startMemoryMb),
      message: `Define a function named ${functionName}.`,
    };
  }

  let passed = 0;
  const testResults: NonNullable<LocalJudgeResult["testResults"]> = [];

  for (const [index, testCase] of cases.entries()) {
    const caseStarted = Date.now();
    try {
      (context as { __args?: unknown[] }).__args = cloneInput(testCase.input);
      const actual = new vm.Script(`${functionName}(...__args)`).runInContext(context, {
        timeout: EXECUTION_TIMEOUT_MS,
      });
      const runtimeMs = Math.max(1, Date.now() - caseStarted);
      const memoryMb = measuredMemoryMb(startMemoryMb);
      if (!sameAnswer(actual, testCase.expected)) {
        testResults.push({
          caseNumber: index + 1,
          status: "Wrong Answer",
          input: testCase.input,
          expected: testCase.expected,
          actual,
          runtimeMs,
          memoryMb,
          message: `Expected ${JSON.stringify(testCase.expected)}, but received ${JSON.stringify(actual)}.`,
        });
        return {
          status: "Wrong Answer",
          passed,
          total: cases.length,
          runtimeMs: Math.max(1, Date.now() - started),
          memoryMb,
          message: `Expected ${JSON.stringify(testCase.expected)}, but received ${JSON.stringify(actual)}.`,
          failedCase: {
            input: testCase.input,
            expected: testCase.expected,
            actual,
          },
          testResults,
        };
      }
      testResults.push({
        caseNumber: index + 1,
        status: "Accepted",
        input: testCase.input,
        expected: testCase.expected,
        actual,
        runtimeMs,
        memoryMb,
      });
      passed += 1;
    } catch (error) {
      const runtimeMs = Math.max(1, Date.now() - caseStarted);
      const memoryMb = measuredMemoryMb(startMemoryMb);
      const message = error instanceof Error ? error.message : String(error || "Code crashed while running.");
      testResults.push({
        caseNumber: index + 1,
        status: "Runtime Error",
        input: testCase.input,
        expected: testCase.expected,
        runtimeMs,
        memoryMb,
        message,
      });
      return {
        status: "Runtime Error",
        passed,
        total: cases.length,
        runtimeMs: Math.max(1, Date.now() - started),
        memoryMb,
        message,
        failedCase: {
          input: testCase.input,
          expected: testCase.expected,
        },
        testResults,
      };
    }
  }

  return {
    status: "Accepted",
    passed,
    total: cases.length,
    runtimeMs: Math.max(1, Date.now() - started),
    memoryMb: measuredMemoryMb(startMemoryMb),
    message: "All selected test cases passed.",
    testResults,
  };
}

function unsupportedRunner(language: string, cases: ProblemCase[]): LocalJudgeResult {
  return {
    status: "Compilation Error",
    passed: 0,
    total: cases.length,
    runtimeMs: 0,
    memoryMb: 0,
    message: `${language} Docker runner is not enabled yet. JavaScript is live; Python, C++, and Java Docker runners are available when JUDGE_DOCKER_ENABLED=true.`,
  };
}

async function judgeWithExternalService(
  input: ServerJudgeInput,
  cases: ProblemCase[],
  functionName: string,
  sqlSetup?: string[],
): Promise<LocalJudgeResult | null> {
  const serviceConfig = getJudgeServiceConfig();
  // If not configured or invalid — return null so Judge0 fallback can run
  if (!serviceConfig.url || !serviceConfig.enabled) {
    if (serviceConfig.url && !serviceConfig.enabled) {
      console.warn(`[judge] External service disabled: ${serviceConfig.reason}`);
    }
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), JUDGE_SERVICE_TIMEOUT_MS);

  try {
    const response = await fetch(`${serviceConfig.url}/judge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.JUDGE_SERVICE_TOKEN
          ? { Authorization: `Bearer ${process.env.JUDGE_SERVICE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        language: input.language,
        code: input.code,
        functionName,
        cases,
        mode: input.mode,
        // SQL-specific fields
        isSql: input.isSql ?? false,
        sqlSetup: sqlSetup ?? [],
        // Shell / Concurrency flags
        isShell: input.isShell ?? false,
        isConcurrency: input.isConcurrency ?? false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        status: "Runtime Error",
        passed: 0,
        total: cases.length,
        runtimeMs: 0,
        memoryMb: 0,
        message: `Judge service returned HTTP ${response.status}.`,
      };
    }

    const payload = await response.json();
    return {
      status: payload.status ?? "Runtime Error",
      passed: Number(payload.passed ?? 0),
      total: Number(payload.total ?? cases.length),
      runtimeMs: Number(payload.runtimeMs ?? 0),
      memoryMb: Number(payload.memoryMb ?? 0),
      message: String(payload.message ?? "External judge completed."),
      failedCase: payload.failedCase,
      testResults: Array.isArray(payload.testResults) ? payload.testResults : undefined,
    };
  } catch (error) {
    return {
      status: "Runtime Error",
      passed: 0,
      total: cases.length,
      runtimeMs: 0,
      memoryMb: 0,
      message: error instanceof Error ? error.message : "Judge service unavailable.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function createJudge0Source(language: string, code: string, cases: ProblemCase[], functionName: string) {
  if (language === "Python") return createPythonHarness(code, functionName, cases);
  if (language === "C++") return createCppHarness(code, functionName, cases);
  if (language === "Java") return createJavaHarness(code, functionName, cases);
  return null;
}

async function judgeWithJudge0(language: string, code: string, cases: ProblemCase[], functionName: string): Promise<LocalJudgeResult | null> {
  if (!JUDGE0_FALLBACK_ENABLED) return null;

  const languageId = JUDGE0_LANGUAGE_IDS[language];
  const sourceCode = createJudge0Source(language, code, cases, functionName);
  if (!languageId || !sourceCode) return null;

  const started = Date.now();
  try {
    const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id: languageId,
        source_code: sourceCode,
        stdin: "",
      }),
      signal: AbortSignal.timeout(JUDGE_SERVICE_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        status: "Runtime Error",
        passed: 0,
        total: cases.length,
        runtimeMs: Math.max(1, Date.now() - started),
        memoryMb: 0,
        message: `Judge0 returned HTTP ${response.status}.`,
      };
    }

    const payload = await response.json();
    const stdout = String(payload.stdout ?? "").trim();
    const stderr = String(payload.compile_output ?? payload.stderr ?? "").trim();
    const lastLine = stdout.split(/\r?\n/).filter(Boolean).at(-1);

    if (!lastLine) {
      return {
        status: Number(payload.status?.id ?? 0) >= 6 ? "Compilation Error" : "Runtime Error",
        passed: 0,
        total: cases.length,
        runtimeMs: Math.max(1, Date.now() - started),
        memoryMb: 0,
        message: stderr || String(payload.status?.description ?? "Cloud judge did not return a result."),
      };
    }

    const result = JSON.parse(lastLine) as Partial<LocalJudgeResult>;
    return {
      status: result.status ?? "Runtime Error",
      passed: Number(result.passed ?? 0),
      total: cases.length,
      runtimeMs: Math.max(1, Math.round(Number(payload.time ?? 0) * 1000) || Date.now() - started),
      memoryMb: Number(result.memoryMb ?? 0),
      message: String(result.message ?? "Cloud judge completed."),
      failedCase: result.failedCase,
      testResults: result.testResults,
    };
  } catch (error) {
    return {
      status: "Runtime Error",
      passed: 0,
      total: cases.length,
      runtimeMs: Math.max(1, Date.now() - started),
      memoryMb: 0,
      message: error instanceof Error ? error.message : "Cloud judge unavailable.",
    };
  }
}

async function runMultiLanguageJudge(language: string, code: string, cases: ProblemCase[], functionName: string) {
  if (process.env.JUDGE_DOCKER_ENABLED === "true") {
    if (language === "Python") return runPythonInDocker(code, cases, functionName);
    if (language === "C++") return runCppInDocker(code, cases, functionName);
    if (language === "Java") return runJavaInDocker(code, cases, functionName);
  }

  const cloudResult = await judgeWithJudge0(language, code, cases, functionName);
  if (cloudResult) return cloudResult;

  // Docker is disabled and Judge0 failed/unavailable — return clear error instead of trying Docker
  return {
    status: "Runtime Error" as const,
    passed: 0,
    total: cases.length,
    runtimeMs: 0,
    memoryMb: 0,
    message: `${language} execution requires the judge service. The service may be starting up — please wait 30–60 seconds and try again.`,
  };
}

function selectSampleCases(cases: ProblemCase[], sampleIndexes?: number[]) {
  if (!sampleIndexes?.length) return cases;

  const selected = sampleIndexes
    .filter((index) => Number.isInteger(index) && index >= 0 && index < cases.length)
    .map((index) => cases[index])
    .filter(Boolean);

  return selected.length ? selected : cases;
}

function normalizeCustomCases(customCases?: ProblemCase[]) {
  if (!customCases?.length) return [];

  return customCases
    .filter((testCase) => Array.isArray(testCase.input) && Object.hasOwn(testCase, "expected"))
    .slice(0, 5)
    .map((testCase) => ({
      input: testCase.input,
      expected: testCase.expected,
    }));
}

export async function judgeProblem(input: ServerJudgeInput): Promise<ServerJudgeResult> {
  const { problem } = await getProblem(input.slug, { includeHiddenCases: true });

  if (!problem) {
    return createCompilationResult("Problem not found.", 0);
  }

  if (problem.judgeReady === false) {
    return {
      status: "Idle",
      passed: 0,
      total: 0,
      runtimeMs: 0,
      memoryMb: 0,
      message: "The judge runner for this problem is not enabled yet. You can read and plan the solution, but Run and Submit are disabled for now.",
      persisted: false,
      persistenceMode: "local",
    };
  }

  // Detect SQL problems — track === "Database" or isSql flag
  const isSqlProblem = input.isSql || (problem as any).track === "Database";
  const isShellProblem = input.isShell || (problem as any).track === "Shell";
  const isConcurrencyProblem = input.isConcurrency || (problem as any).track === "Concurrency";
  const sqlSetup: string[] = (problem as any).sqlSetup ?? [];

  const cases =
    input.mode === "submit"
      ? [...problem.sampleCases, ...problem.hiddenCases]
      : [...selectSampleCases(problem.sampleCases, input.sampleIndexes), ...normalizeCustomCases(input.customCases)];

  const externalJudgeResult = await judgeWithExternalService(
    { ...input, isSql: isSqlProblem, isShell: isShellProblem, isConcurrency: isConcurrencyProblem },
    cases,
    problem.functionName,
    sqlSetup,
  );

  const judgeResult =
    externalJudgeResult ??
    ((isSqlProblem || isShellProblem || isConcurrencyProblem)
      ? {
          status: "Runtime Error" as const,
          passed: 0,
          total: cases.length,
          runtimeMs: 0,
          memoryMb: 0,
          message: isSqlProblem
            ? "SQL judge requires the external judge service. Please ensure JUDGE_SERVICE_URL is configured."
            : isShellProblem
              ? "Shell judge requires the external judge service. Please ensure JUDGE_SERVICE_URL is configured."
              : "Concurrency judge requires the external judge service. Please ensure JUDGE_SERVICE_URL is configured.",
        }
      :
    (cases.length === 0
      ? {
          status: "Idle" as const,
          passed: 0,
          total: 0,
          runtimeMs: 0,
          memoryMb: 0,
          message: "Runner for this problem type will be enabled after Docker sandbox support.",
        }
      : input.language === "JavaScript"
        ? runJavaScript(input.code, cases, problem.functionName)
        : input.language === "Python"
          ? await runMultiLanguageJudge(input.language, input.code, cases, problem.functionName)
          : input.language === "C++"
            ? await runMultiLanguageJudge(input.language, input.code, cases, problem.functionName)
            : input.language === "Java"
              ? await runMultiLanguageJudge(input.language, input.code, cases, problem.functionName)
              : unsupportedRunner(input.language, cases)));

  const persistence = await saveProblemSubmission({
    slug: input.slug,
    userId: input.userId ?? null,
    language: input.language,
    code: input.code,
    status: judgeResult.status,
    passed: judgeResult.passed,
    total: judgeResult.total,
    runtimeMs: judgeResult.runtimeMs,
    memoryMb: judgeResult.memoryMb,
    message: judgeResult.message,
    testResults: judgeResult.testResults,
  });

  return {
    ...judgeResult,
    persisted: persistence.persisted,
    persistenceMode: persistence.mode,
    submissionId: persistence.persisted ? persistence.submissionId : undefined,
  };
}
