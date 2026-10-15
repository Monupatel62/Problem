import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { ProblemCase } from "@/lib/problems/bank";

export type DockerRunnerResult = {
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error";
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
};

const PYTHON_IMAGE = process.env.JUDGE_PYTHON_IMAGE || "python:3.12-alpine";
const CPP_IMAGE = process.env.JUDGE_CPP_IMAGE || "gcc:13";
const JAVA_IMAGE = process.env.JUDGE_JAVA_IMAGE || "eclipse-temurin:21";
const RUNNER_TIMEOUT_MS = Number(process.env.JUDGE_DOCKER_TIMEOUT_MS || 15_000);
const MAX_STDIO_LENGTH = Number(process.env.JUDGE_MAX_STDIO_LENGTH || 200_000);

function dockerEnabled() {
  return process.env.JUDGE_DOCKER_ENABLED === "true";
}

function runProcess(command: string, args: string[], timeoutMs: number) {
  return new Promise<{ code: number | null; stdout: string; stderr: string; timedOut: boolean }>((resolve) => {
    const child = spawn(command, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > MAX_STDIO_LENGTH) child.kill("SIGKILL");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > MAX_STDIO_LENGTH) child.kill("SIGKILL");
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ code: 1, stdout, stderr: error.message, timedOut });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });
  });
}

export function createPythonHarness(code: string, functionName: string, cases: ProblemCase[]) {
  return `
import json
import traceback

${code}

CASES = json.loads(${JSON.stringify(JSON.stringify(cases))})
FUNCTION_NAME = ${JSON.stringify(functionName)}

def normalize(value):
    return value

def get_callable():
    if FUNCTION_NAME in globals() and callable(globals()[FUNCTION_NAME]):
        return globals()[FUNCTION_NAME]
    if "Solution" in globals():
        instance = Solution()
        candidate = getattr(instance, FUNCTION_NAME, None)
        if callable(candidate):
            return candidate
    raise NameError(f"Define {FUNCTION_NAME} or Solution.{FUNCTION_NAME}.")

def same_answer(actual, expected):
    if isinstance(actual, (int, float)) and isinstance(expected, (int, float)):
        return abs(actual - expected) <= 1e-9
    if isinstance(actual, str) and isinstance(expected, (int, float)):
        try:
            return abs(float(actual) - expected) <= 1e-9
        except ValueError:
            return False
    if isinstance(actual, (int, float)) and isinstance(expected, str):
        try:
            return abs(actual - float(expected)) <= 1e-9
        except ValueError:
            return False
    if isinstance(actual, list) and isinstance(expected, list):
        return len(actual) == len(expected) and all(same_answer(a, b) for a, b in zip(actual, expected))
    return normalize(actual) == normalize(expected)

def main():
    fn = get_callable()
    passed = 0
    test_results = []
    for index, case in enumerate(CASES):
        case_started = __import__("time").time()
        try:
            actual = fn(*case["input"])
        except Exception as exc:
            runtime_ms = max(1, round((__import__("time").time() - case_started) * 1000))
            test_results.append({
                "caseNumber": index + 1,
                "status": "Runtime Error",
                "input": case["input"],
                "expected": case["expected"],
                "runtimeMs": runtime_ms,
                "memoryMb": 48,
                "message": str(exc),
            })
            print(json.dumps({
                "status": "Runtime Error",
                "passed": passed,
                "message": str(exc),
                "failedCase": {"input": case["input"], "expected": case["expected"]},
                "testResults": test_results,
            }))
            return
        runtime_ms = max(1, round((__import__("time").time() - case_started) * 1000))
        if not same_answer(actual, case["expected"]):
            test_results.append({
                "caseNumber": index + 1,
                "status": "Wrong Answer",
                "input": case["input"],
                "expected": case["expected"],
                "actual": actual,
                "runtimeMs": runtime_ms,
                "memoryMb": 48,
                "message": f"Expected {case['expected']}, but received {actual}.",
            })
            print(json.dumps({
                "status": "Wrong Answer",
                "passed": passed,
                "message": f"Expected {case['expected']}, but received {actual}.",
                "failedCase": {"input": case["input"], "expected": case["expected"], "actual": actual},
                "testResults": test_results,
            }))
            return
        test_results.append({
            "caseNumber": index + 1,
            "status": "Accepted",
            "input": case["input"],
            "expected": case["expected"],
            "actual": actual,
            "runtimeMs": runtime_ms,
            "memoryMb": 48,
        })
        passed += 1
    print(json.dumps({"status": "Accepted", "passed": passed, "message": "All selected test cases passed.", "testResults": test_results}))

try:
    main()
except Exception as exc:
    print(json.dumps({"status": "Compilation Error", "passed": 0, "message": str(exc)}))
`;
}

export async function runPythonInDocker(code: string, cases: ProblemCase[], functionName: string): Promise<DockerRunnerResult> {
  if (!dockerEnabled()) {
    return {
      status: "Compilation Error",
      passed: 0,
      total: cases.length,
      runtimeMs: 0,
      memoryMb: 0,
      message: "Python Docker runner is disabled. Set JUDGE_DOCKER_ENABLED=true on a Docker-capable server.",
    };
  }

  const started = Date.now();
  const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-judge-"));

  try {
    await writeFile(path.join(workDir, "runner.py"), createPythonHarness(code, functionName, cases), "utf8");

    const result = await runProcess(
      "docker",
      [
        "run",
        "--rm",
        "--network",
        "none",
        "--cpus",
        "0.5",
        "--memory",
        "128m",
        "--pids-limit",
        "64",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges",
        "--tmpfs",
        "/tmp:rw,nosuid,nodev,size=64m",
        "-v",
        `${workDir}:/work:ro`,
        "-w",
        "/work",
        PYTHON_IMAGE,
        "python",
        "runner.py",
      ],
      RUNNER_TIMEOUT_MS,
    );

    const runtimeMs = Math.max(1, Date.now() - started);
    if (result.timedOut) {
      return {
        status: "Runtime Error",
        passed: 0,
        total: cases.length,
        runtimeMs,
        memoryMb: 128,
        message: "Execution timed out.",
      };
    }

    if (result.code !== 0 && !result.stdout.trim()) {
      const stderr = result.stderr.trim();
      return {
        status: /SyntaxError|IndentationError|TabError/.test(stderr) ? "Compilation Error" : "Runtime Error",
        passed: 0,
        total: cases.length,
        runtimeMs,
        memoryMb: 128,
        message: stderr || "Docker runner failed.",
      };
    }

    const line = result.stdout.trim().split(/\r?\n/).at(-1) ?? "";
    const payload = JSON.parse(line) as Partial<DockerRunnerResult>;

    return {
      status: payload.status ?? "Runtime Error",
      passed: Number(payload.passed ?? 0),
      total: cases.length,
      runtimeMs,
      memoryMb: 48,
      message: String(payload.message ?? "Python runner completed."),
      failedCase: payload.failedCase,
      testResults: payload.testResults,
    };
  } catch (error) {
    return {
      status: "Runtime Error",
      passed: 0,
      total: cases.length,
      runtimeMs: Math.max(1, Date.now() - started),
      memoryMb: 0,
      message: error instanceof Error ? error.message : "Python Docker runner failed.",
    };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

export function createCppHarness(code: string, functionName: string, cases: ProblemCase[]) {
  function cppLiteral(value: unknown): string {
    if (Array.isArray(value)) {
      if (value.every((item) => typeof item === "number")) return `vector<int>{${value.join(",")}}`;
      if (value.every((item) => Array.isArray(item))) return `vector<vector<int>>{${value.map(cppLiteral).join(",")}}`;
      return `{${value.map(cppLiteral).join(",")}}`;
    }
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(value);
    if (typeof value === "boolean") return value ? "true" : "false";
    return "{}";
  }

  return `
#include <bits/stdc++.h>
using namespace std;

${code}

template <typename T>
string toJson(const vector<T>& values);

string toJson(const string& value) {
  string out = "\\"";
  for (char ch : value) {
    if (ch == '\\"') out += "\\\\\\"";
    else if (ch == '\\\\') out += "\\\\\\\\";
    else out += ch;
  }
  out += "\\"";
  return out;
}

string toJson(const char* value) { return toJson(string(value)); }
string toJson(int value) { return to_string(value); }
string toJson(long long value) { return to_string(value); }
string toJson(double value) {
  ostringstream stream;
  stream << setprecision(12) << value;
  return stream.str();
}
string toJson(bool value) { return value ? "true" : "false"; }

template <typename T>
string toJson(const vector<T>& values) {
  string out = "[";
  for (size_t i = 0; i < values.size(); ++i) {
    if (i) out += ",";
    out += toJson(values[i]);
  }
  out += "]";
  return out;
}

bool sameJson(const string& actual, const string& expected) {
  if (actual == expected) return true;
  char* endActual = nullptr;
  char* endExpected = nullptr;
  double actualNumber = strtod(actual.c_str(), &endActual);
  double expectedNumber = strtod(expected.c_str(), &endExpected);
  return endActual && *endActual == '\\0' && endExpected && *endExpected == '\\0' && fabs(actualNumber - expectedNumber) <= 1e-9;
}

int main() {
  Solution solution;
  int passed = 0;
  vector<string> testResults;
${cases
  .map((testCase, index) => {
    const argDeclarations = testCase.input
      .map((value, argIndex) => (Array.isArray(value) ? `    auto arg${index}_${argIndex} = ${cppLiteral(value)};` : ""))
      .filter(Boolean)
      .join("\n");
    const args = testCase.input
      .map((value, argIndex) => (Array.isArray(value) ? `arg${index}_${argIndex}` : cppLiteral(value)))
      .join(", ");
    const expectedJson = JSON.stringify(JSON.stringify(testCase.expected));
    return `  try {
${argDeclarations}
    auto result${index} = solution.${functionName}(${args});
    string actual${index} = toJson(result${index});
    string expected${index} = ${expectedJson};
    if (!sameJson(actual${index}, expected${index})) {
      testResults.push_back("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Wrong Answer\\",\\"input\\":${JSON.stringify(JSON.stringify(testCase.input))},\\"expected\\":" + expected${index} + ",\\"actual\\":" + actual${index} + ",\\"runtimeMs\\":1,\\"memoryMb\\":72,\\"message\\":\\"Expected " + expected${index} + ", but received " + actual${index} + ".\\"}");
      cout << "{\\"status\\":\\"Wrong Answer\\",\\"passed\\":" << passed << ",\\"message\\":\\"Expected " << expected${index} << ", but received " << actual${index} << ".\\",\\"failedCase\\":{\\"input\\":${JSON.stringify(JSON.stringify(testCase.input))},\\"expected\\":" << expected${index} << ",\\"actual\\":" << actual${index} << "},\\"testResults\\":["; for (size_t j = 0; j < testResults.size(); ++j) { if (j) cout << ","; cout << testResults[j]; } cout << "]}" << endl;
      return 0;
    }
    testResults.push_back("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Accepted\\",\\"input\\":${JSON.stringify(JSON.stringify(testCase.input))},\\"expected\\":" + expected${index} + ",\\"actual\\":" + actual${index} + ",\\"runtimeMs\\":1,\\"memoryMb\\":72}");
    passed++;
  } catch (const exception& error) {
    testResults.push_back("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Runtime Error\\",\\"input\\":${JSON.stringify(JSON.stringify(testCase.input))},\\"expected\\":${JSON.stringify(JSON.stringify(testCase.expected))},\\"runtimeMs\\":1,\\"memoryMb\\":72,\\"message\\":\\"C++ solution threw an exception.\\"}");
    cout << "{\\"status\\":\\"Runtime Error\\",\\"passed\\":${index},\\"message\\":\\"C++ solution threw an exception.\\",\\"testResults\\":["; for (size_t j = 0; j < testResults.size(); ++j) { if (j) cout << ","; cout << testResults[j]; } cout << "]}" << endl;
    return 0;
  }`;
  })
  .join("\n")}
  cout << "{\\"status\\":\\"Accepted\\",\\"passed\\":" << passed << ",\\"message\\":\\"All selected test cases passed.\\",\\"testResults\\":["; for (size_t j = 0; j < testResults.size(); ++j) { if (j) cout << ","; cout << testResults[j]; } cout << "]}" << endl;
  return 0;
}
`;
}

export async function runCppInDocker(code: string, cases: ProblemCase[], functionName: string): Promise<DockerRunnerResult> {
  if (!dockerEnabled()) {
    return {
      status: "Compilation Error",
      passed: 0,
      total: cases.length,
      runtimeMs: 0,
      memoryMb: 0,
      message: "C++ Docker runner is disabled. Set JUDGE_DOCKER_ENABLED=true on a Docker-capable server.",
    };
  }

  const started = Date.now();
  const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-judge-"));

  try {
    await writeFile(path.join(workDir, "runner.cpp"), createCppHarness(code, functionName, cases), "utf8");
    const result = await runProcess(
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
        "--tmpfs",
        "/tmp:rw,nosuid,nodev,size=64m",
        "-v",
        `${workDir}:/work`,
        "-w",
        "/work",
        CPP_IMAGE,
        "bash",
        "-lc",
        "g++ -std=c++17 -O2 runner.cpp -o runner && ./runner",
      ],
      RUNNER_TIMEOUT_MS,
    );
    const runtimeMs = Math.max(1, Date.now() - started);

    if (result.timedOut) {
      return {
        status: "Runtime Error",
        passed: 0,
        total: cases.length,
        runtimeMs,
        memoryMb: 256,
        message: "Execution timed out.",
      };
    }

    if (result.code !== 0 && !result.stdout.trim()) {
      return {
        status: "Compilation Error",
        passed: 0,
        total: cases.length,
        runtimeMs,
        memoryMb: 256,
        message: result.stderr.trim() || "C++ compile failed.",
      };
    }

    const line = result.stdout.trim().split(/\r?\n/).at(-1) ?? "";
    const payload = JSON.parse(line) as Partial<DockerRunnerResult>;

    return {
      status: payload.status ?? "Runtime Error",
      passed: Number(payload.passed ?? 0),
      total: cases.length,
      runtimeMs,
      memoryMb: 72,
      message: String(payload.message ?? "C++ runner completed."),
      failedCase: payload.failedCase,
      testResults: payload.testResults,
    };
  } catch (error) {
    return {
      status: "Runtime Error",
      passed: 0,
      total: cases.length,
      runtimeMs: Math.max(1, Date.now() - started),
      memoryMb: 0,
      message: error instanceof Error ? error.message : "C++ Docker runner failed.",
    };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

export function createJavaHarness(code: string, functionName: string, cases: ProblemCase[]) {
  function javaLiteral(value: unknown): string {
    if (Array.isArray(value)) {
      if (value.every((item) => typeof item === "number")) return `new int[]{${value.join(",")}}`;
      if (value.every((item) => Array.isArray(item))) return `new int[][]{${value.map(javaLiteral).join(",")}}`;
      return `new Object[]{${value.map(javaLiteral).join(",")}}`;
    }
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(value);
    if (typeof value === "boolean") return value ? "true" : "false";
    return "null";
  }

  return `
import java.util.*;

${code}

public class Main {
  static String toJson(int value) { return Integer.toString(value); }
  static String toJson(long value) { return Long.toString(value); }
  static String toJson(double value) { return Double.toString(value); }
  static String toJson(boolean value) { return value ? "true" : "false"; }
  static String toJson(String value) { return "\\"" + value.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"") + "\\""; }
  static String toJson(int[] values) {
    StringBuilder out = new StringBuilder("[");
    for (int i = 0; i < values.length; i++) {
      if (i > 0) out.append(",");
      out.append(values[i]);
    }
    return out.append("]").toString();
  }
  static String toJson(int[][] values) {
    StringBuilder out = new StringBuilder("[");
    for (int i = 0; i < values.length; i++) {
      if (i > 0) out.append(",");
      out.append(toJson(values[i]));
    }
    return out.append("]").toString();
  }
  static boolean sameJson(String actual, String expected) {
    if (actual.equals(expected)) return true;
    try {
      return Math.abs(Double.parseDouble(actual) - Double.parseDouble(expected)) <= 1e-9;
    } catch (NumberFormatException error) {
      return false;
    }
  }

  public static void main(String[] args) {
    Solution solution = new Solution();
    int passed = 0;
    ArrayList<String> testResults = new ArrayList<>();
${cases
  .map((testCase, index) => {
    const argDeclarations = testCase.input
      .map((value, argIndex) => (Array.isArray(value) ? `      var arg${index}_${argIndex} = ${javaLiteral(value)};` : ""))
      .filter(Boolean)
      .join("\n");
    const args = testCase.input
      .map((value, argIndex) => (Array.isArray(value) ? `arg${index}_${argIndex}` : javaLiteral(value)))
      .join(", ");
    const expectedJson = JSON.stringify(JSON.stringify(testCase.expected));
    return `    try {
${argDeclarations}
      var result${index} = solution.${functionName}(${args});
      String actual${index} = toJson(result${index});
      String expected${index} = ${expectedJson};
      if (!sameJson(actual${index}, expected${index})) {
        testResults.add("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Wrong Answer\\",\\"input\\":${JSON.stringify(JSON.stringify(testCase.input))},\\"expected\\":" + expected${index} + ",\\"actual\\":" + actual${index} + ",\\"runtimeMs\\":1,\\"memoryMb\\":96,\\"message\\":\\"Expected " + expected${index} + ", but received " + actual${index} + ".\\"}");
        System.out.println("{\\"status\\":\\"Wrong Answer\\",\\"passed\\":" + passed + ",\\"message\\":\\"Expected " + expected${index} + ", but received " + actual${index} + ".\\",\\"failedCase\\":{\\"input\\":${JSON.stringify(JSON.stringify(testCase.input))},\\"expected\\":" + expected${index} + ",\\"actual\\":" + actual${index} + "},\\"testResults\\":[" + String.join(",", testResults) + "]}");
        return;
      }
      testResults.add("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Accepted\\",\\"input\\":${JSON.stringify(JSON.stringify(testCase.input))},\\"expected\\":" + expected${index} + ",\\"actual\\":" + actual${index} + ",\\"runtimeMs\\":1,\\"memoryMb\\":96}");
      passed++;
    } catch (Exception error) {
      testResults.add("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Runtime Error\\",\\"input\\":${JSON.stringify(JSON.stringify(testCase.input))},\\"expected\\":${JSON.stringify(JSON.stringify(testCase.expected))},\\"runtimeMs\\":1,\\"memoryMb\\":96,\\"message\\":\\"Java solution threw an exception.\\"}");
      System.out.println("{\\"status\\":\\"Runtime Error\\",\\"passed\\":${index},\\"message\\":\\"Java solution threw an exception.\\",\\"testResults\\":[" + String.join(",", testResults) + "]}");
      return;
    }`;
  })
  .join("\n")}
    System.out.println("{\\"status\\":\\"Accepted\\",\\"passed\\":" + passed + ",\\"message\\":\\"All selected test cases passed.\\",\\"testResults\\":[" + String.join(",", testResults) + "]}");
  }
}
`;
}

export async function runJavaInDocker(code: string, cases: ProblemCase[], functionName: string): Promise<DockerRunnerResult> {
  if (!dockerEnabled()) {
    return {
      status: "Compilation Error",
      passed: 0,
      total: cases.length,
      runtimeMs: 0,
      memoryMb: 0,
      message: "Java Docker runner is disabled. Set JUDGE_DOCKER_ENABLED=true on a Docker-capable server.",
    };
  }

  const started = Date.now();
  const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-judge-"));

  try {
    await writeFile(path.join(workDir, "Main.java"), createJavaHarness(code, functionName, cases), "utf8");
    const result = await runProcess(
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
        "96",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges",
        "--tmpfs",
        "/tmp:rw,nosuid,nodev,size=64m",
        "-v",
        `${workDir}:/work`,
        "-w",
        "/work",
        JAVA_IMAGE,
        "bash",
        "-lc",
        "javac Main.java && java Main",
      ],
      RUNNER_TIMEOUT_MS,
    );
    const runtimeMs = Math.max(1, Date.now() - started);

    if (result.timedOut) {
      return {
        status: "Runtime Error",
        passed: 0,
        total: cases.length,
        runtimeMs,
        memoryMb: 256,
        message: "Execution timed out.",
      };
    }

    if (result.code !== 0 && !result.stdout.trim()) {
      return {
        status: "Compilation Error",
        passed: 0,
        total: cases.length,
        runtimeMs,
        memoryMb: 256,
        message: result.stderr.trim() || "Java compile failed.",
      };
    }

    const line = result.stdout.trim().split(/\r?\n/).at(-1) ?? "";
    const payload = JSON.parse(line) as Partial<DockerRunnerResult>;

    return {
      status: payload.status ?? "Runtime Error",
      passed: Number(payload.passed ?? 0),
      total: cases.length,
      runtimeMs,
      memoryMb: 96,
      message: String(payload.message ?? "Java runner completed."),
      failedCase: payload.failedCase,
      testResults: payload.testResults,
    };
  } catch (error) {
    return {
      status: "Runtime Error",
      passed: 0,
      total: cases.length,
      runtimeMs: Math.max(1, Date.now() - started),
      memoryMb: 0,
      message: error instanceof Error ? error.message : "Java Docker runner failed.",
    };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
