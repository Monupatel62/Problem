import http from "node:http";
import vm from "node:vm";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const PORT = Number(process.env.PORT || process.env.JUDGE_WORKER_PORT || 8787);
const TOKEN = process.env.JUDGE_SERVICE_TOKEN || "";
const TIMEOUT_MS = Number(process.env.JUDGE_DOCKER_TIMEOUT_MS || 15_000);
const PYTHON_IMAGE = process.env.JUDGE_PYTHON_IMAGE || "python:3.12-alpine";
const CPP_IMAGE = process.env.JUDGE_CPP_IMAGE || "gcc:13";
const JAVA_IMAGE = process.env.JUDGE_JAVA_IMAGE || "eclipse-temurin:21";
const MAX_CODE_LENGTH = Number(process.env.JUDGE_MAX_CODE_LENGTH || 50_000);
const MAX_CASES = Number(process.env.JUDGE_MAX_CASES || 30);
const MAX_STDIO_LENGTH = Number(process.env.JUDGE_MAX_STDIO_LENGTH || 200_000);
const CONTAINER_WORKDIR = process.env.JUDGE_CONTAINER_WORKDIR || tmpdir();
const HOST_WORKDIR = process.env.JUDGE_HOST_WORKDIR || CONTAINER_WORKDIR;
const REQUIRE_TOKEN = process.env.NODE_ENV === "production" && process.env.JUDGE_ALLOW_UNAUTHENTICATED !== "true";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Payload too large."));
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function isAuthorized(request) {
  if (REQUIRE_TOKEN && !TOKEN) return false;
  if (!TOKEN) return true;
  return request.headers.authorization === `Bearer ${TOKEN}`;
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "number") return Number.isFinite(value) ? value : String(value);
  return value;
}

function sameAnswer(actual, expected) {
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
  return JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expected));
}

function cloneInput(input) {
  return input.map((value) => {
    if (Array.isArray(value) || (value && typeof value === "object")) return JSON.parse(JSON.stringify(value));
    return value;
  });
}

function runJavaScript(code, cases, functionName) {
  if (code.length > MAX_CODE_LENGTH) {
    return { status: "Compilation Error", passed: 0, total: cases.length, runtimeMs: 0, memoryMb: 0, message: "Code is too large." };
  }

  const started = Date.now();
  const context = vm.createContext({});
  let solution;

  try {
    solution = new vm.Script(`"use strict";\n${code}\n;typeof ${functionName} === "function" ? ${functionName} : undefined;`).runInContext(context, {
      timeout: TIMEOUT_MS,
    });
  } catch (error) {
    return { status: "Compilation Error", passed: 0, total: cases.length, runtimeMs: Date.now() - started, memoryMb: 0, message: error.message };
  }

  if (typeof solution !== "function") {
    return { status: "Compilation Error", passed: 0, total: cases.length, runtimeMs: Date.now() - started, memoryMb: 0, message: `Define a function named ${functionName}.` };
  }

  let passed = 0;
  const testResults = [];
  for (const [index, testCase] of cases.entries()) {
    const caseStarted = Date.now();
    try {
      context.__args = cloneInput(testCase.input);
      const actual = new vm.Script(`${functionName}(...__args)`).runInContext(context, { timeout: TIMEOUT_MS });
      const caseResult = {
        caseNumber: index + 1,
        status: sameAnswer(actual, testCase.expected) ? "Accepted" : "Wrong Answer",
        input: testCase.input,
        expected: testCase.expected,
        actual,
        runtimeMs: Math.max(1, Date.now() - caseStarted),
        memoryMb: 40,
      };
      if (!sameAnswer(actual, testCase.expected)) {
        testResults.push({
          ...caseResult,
          message: `Expected ${JSON.stringify(testCase.expected)}, but received ${JSON.stringify(actual)}.`,
        });
        return {
          status: "Wrong Answer",
          passed,
          total: cases.length,
          runtimeMs: Math.max(1, Date.now() - started),
          memoryMb: 40,
          message: `Expected ${JSON.stringify(testCase.expected)}, but received ${JSON.stringify(actual)}.`,
          failedCase: { input: testCase.input, expected: testCase.expected, actual },
          testResults,
        };
      }
      testResults.push(caseResult);
      passed += 1;
    } catch (error) {
      testResults.push({
        caseNumber: index + 1,
        status: "Runtime Error",
        input: testCase.input,
        expected: testCase.expected,
        runtimeMs: Math.max(1, Date.now() - caseStarted),
        memoryMb: 40,
        message: error.message,
      });
      return {
        status: "Runtime Error",
        passed,
        total: cases.length,
        runtimeMs: Math.max(1, Date.now() - started),
        memoryMb: 40,
        message: error.message,
        failedCase: { input: testCase.input, expected: testCase.expected },
        testResults,
      };
    }
  }

  return { status: "Accepted", passed, total: cases.length, runtimeMs: Math.max(1, Date.now() - started), memoryMb: 40, message: "All selected test cases passed.", testResults };
}

function runProcess(command, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
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

function pythonHarness(code, functionName, cases) {
  return `
import json
import time
${code}
CASES = json.loads(${JSON.stringify(JSON.stringify(cases))})
FUNCTION_NAME = ${JSON.stringify(functionName)}
def get_callable():
    if FUNCTION_NAME in globals() and callable(globals()[FUNCTION_NAME]):
        return globals()[FUNCTION_NAME]
    if "Solution" in globals():
        fn = getattr(Solution(), FUNCTION_NAME, None)
        if callable(fn):
            return fn
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
    return actual == expected
def main():
    fn = get_callable()
    passed = 0
    test_results = []
    for index, case in enumerate(CASES):
        case_started = time.time()
        try:
            actual = fn(*case["input"])
        except Exception as exc:
            runtime_ms = max(1, round((time.time() - case_started) * 1000))
            test_results.append({"caseNumber":index+1,"status":"Runtime Error","input":case["input"],"expected":case["expected"],"runtimeMs":runtime_ms,"memoryMb":48,"message":str(exc)})
            print(json.dumps({"status":"Runtime Error","passed":passed,"message":str(exc),"failedCase":{"input":case["input"],"expected":case["expected"]},"testResults":test_results})); return
        runtime_ms = max(1, round((time.time() - case_started) * 1000))
        if not same_answer(actual, case["expected"]):
            test_results.append({"caseNumber":index+1,"status":"Wrong Answer","input":case["input"],"expected":case["expected"],"actual":actual,"runtimeMs":runtime_ms,"memoryMb":48,"message":f"Expected {case['expected']}, but received {actual}."})
            print(json.dumps({"status":"Wrong Answer","passed":passed,"message":f"Expected {case['expected']}, but received {actual}.","failedCase":{"input":case["input"],"expected":case["expected"],"actual":actual},"testResults":test_results})); return
        test_results.append({"caseNumber":index+1,"status":"Accepted","input":case["input"],"expected":case["expected"],"actual":actual,"runtimeMs":runtime_ms,"memoryMb":48})
        passed += 1
    print(json.dumps({"status":"Accepted","passed":passed,"message":"All selected test cases passed.","testResults":test_results}))
try:
    main()
except Exception as exc:
    print(json.dumps({"status":"Compilation Error","passed":0,"message":str(exc)}))
`;
}

function dockerMountPath(workDir) {
  const relativeWorkDir = path.relative(CONTAINER_WORKDIR, workDir);
  if (!relativeWorkDir || relativeWorkDir.startsWith("..")) return workDir;
  return HOST_WORKDIR.replace(/[\\/]+$/, "") + "/" + relativeWorkDir.replaceAll("\\", "/");
}

async function createWorkDir() {
  await mkdir(CONTAINER_WORKDIR, { recursive: true });
  return mkdtemp(path.join(CONTAINER_WORKDIR, "wohotech-worker-"));
}

function dockerArgs(image, workDir, command) {
  return [
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
    `${dockerMountPath(workDir)}:/work`,
    "-w",
    "/work",
    image,
    "sh",
    "-lc",
    command,
  ];
}

async function runPython(code, cases, functionName) {
  const started = Date.now();
  const workDir = await createWorkDir();
  try {
    await writeFile(path.join(workDir, "runner.py"), pythonHarness(code, functionName, cases));
    const result = await runProcess("docker", dockerArgs(PYTHON_IMAGE, workDir, "python runner.py"), TIMEOUT_MS);
    return parseDockerResult(result, cases.length, started, 48);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

function cppLiteral(value) {
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "number")) return `vector<int>{${value.join(",")}}`;
    if (value.every((item) => Array.isArray(item))) return `vector<vector<int>>{${value.map(cppLiteral).join(",")}}`;
    return `{${value.map(cppLiteral).join(",")}}`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "{}";
}

function cppHarness(code, functionName, cases) {
  return `
#include <bits/stdc++.h>
using namespace std;
${code}
template <typename T> string toJson(const vector<T>& values);
string toJson(int value){ return to_string(value); }
string toJson(long long value){ return to_string(value); }
string toJson(double value){ ostringstream s; s << setprecision(12) << value; return s.str(); }
string toJson(bool value){ return value ? "true" : "false"; }
string toJson(const string& value){ return string("\\"") + value + "\\""; }
template <typename T> string toJson(const vector<T>& values){ string out="["; for(size_t i=0;i<values.size();++i){ if(i) out+=","; out+=toJson(values[i]); } return out+"]"; }
bool sameJson(const string& actual, const string& expected){
  if(actual == expected) return true;
  char* endA = nullptr;
  char* endE = nullptr;
  double a = strtod(actual.c_str(), &endA);
  double e = strtod(expected.c_str(), &endE);
  return endA && *endA == '\\0' && endE && *endE == '\\0' && fabs(a - e) <= 1e-9;
}
int main(){
  Solution solution;
  int passed = 0;
  vector<string> testResults;
${cases
  .map((testCase, index) => {
    const declarations = testCase.input.map((value, argIndex) => (Array.isArray(value) ? `  auto arg${index}_${argIndex} = ${cppLiteral(value)};` : "")).filter(Boolean).join("\n");
    const args = testCase.input.map((value, argIndex) => (Array.isArray(value) ? `arg${index}_${argIndex}` : cppLiteral(value))).join(", ");
    const input = JSON.stringify(JSON.stringify(testCase.input));
    const expected = JSON.stringify(JSON.stringify(testCase.expected));
    return `  try {
${declarations}
    auto result${index} = solution.${functionName}(${args});
    string actual${index} = toJson(result${index});
    string expected${index} = ${expected};
    if(!sameJson(actual${index}, expected${index})){
      testResults.push_back("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Wrong Answer\\",\\"input\\":" + string(${input}) + ",\\"expected\\":" + expected${index} + ",\\"actual\\":" + actual${index} + ",\\"runtimeMs\\":1,\\"memoryMb\\":72,\\"message\\":\\"Expected " + expected${index} + ", but received " + actual${index} + ".\\"}");
      cout << "{\\"status\\":\\"Wrong Answer\\",\\"passed\\":" << passed << ",\\"message\\":\\"Expected " << expected${index} << ", but received " << actual${index} << ".\\",\\"failedCase\\":{\\"input\\":" << ${input} << ",\\"expected\\":" << expected${index} << ",\\"actual\\":" << actual${index} << "},\\"testResults\\":["; for(size_t j=0;j<testResults.size();++j){ if(j) cout << ","; cout << testResults[j]; } cout << "]}" << endl; return 0; }
    testResults.push_back("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Accepted\\",\\"input\\":" + string(${input}) + ",\\"expected\\":" + expected${index} + ",\\"actual\\":" + actual${index} + ",\\"runtimeMs\\":1,\\"memoryMb\\":72}");
    passed++;
  } catch(...) {
    testResults.push_back("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Runtime Error\\",\\"input\\":" + string(${input}) + ",\\"expected\\":" + string(${expected}) + ",\\"runtimeMs\\":1,\\"memoryMb\\":72,\\"message\\":\\"C++ solution threw an exception.\\"}");
    cout << "{\\"status\\":\\"Runtime Error\\",\\"passed\\":${index},\\"message\\":\\"C++ solution threw an exception.\\",\\"testResults\\":["; for(size_t j=0;j<testResults.size();++j){ if(j) cout << ","; cout << testResults[j]; } cout << "]}" << endl; return 0; }`;
  }).join("\n")}
  cout << "{\\"status\\":\\"Accepted\\",\\"passed\\":" << passed << ",\\"message\\":\\"All selected test cases passed.\\",\\"testResults\\":["; for(size_t j=0;j<testResults.size();++j){ if(j) cout << ","; cout << testResults[j]; } cout << "]}" << endl;
}
`;
}

async function runCpp(code, cases, functionName) {
  const started = Date.now();
  const workDir = await createWorkDir();
  try {
    await writeFile(path.join(workDir, "runner.cpp"), cppHarness(code, functionName, cases));
    const result = await runProcess("docker", dockerArgs(CPP_IMAGE, workDir, "g++ -std=c++17 -O2 runner.cpp -o runner && ./runner"), TIMEOUT_MS);
    return parseDockerResult(result, cases.length, started, 72);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

function javaLiteral(value) {
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "number")) return `new int[]{${value.join(",")}}`;
    if (value.every((item) => Array.isArray(item))) return `new int[][]{${value.map(javaLiteral).join(",")}}`;
    return `new Object[]{${value.map(javaLiteral).join(",")}}`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "null";
}

function javaHarness(code, functionName, cases) {
  return `
import java.util.*;
${code}
public class Main {
  static String toJson(int value){ return Integer.toString(value); }
  static String toJson(long value){ return Long.toString(value); }
  static String toJson(double value){ return Double.toString(value); }
  static String toJson(boolean value){ return value ? "true" : "false"; }
  static String toJson(String value){
    StringBuilder out = new StringBuilder();
    out.append('"');
    for(int i=0;i<value.length();i++){
      char c = value.charAt(i);
      if(c == '\\\\' || c == '"') out.append('\\\\');
      out.append(c);
    }
    out.append('"');
    return out.toString();
  }
  static String toJson(int[] values){ StringBuilder out = new StringBuilder("["); for(int i=0;i<values.length;i++){ if(i>0) out.append(","); out.append(values[i]); } return out.append("]").toString(); }
  static String toJson(int[][] values){ StringBuilder out = new StringBuilder("["); for(int i=0;i<values.length;i++){ if(i>0) out.append(","); out.append(toJson(values[i])); } return out.append("]").toString(); }
  static boolean sameJson(String actual, String expected){
    if(actual.equals(expected)) return true;
    try {
      return Math.abs(Double.parseDouble(actual) - Double.parseDouble(expected)) <= 1e-9;
    } catch(NumberFormatException error) {
      return false;
    }
  }
  public static void main(String[] args){
    Solution solution = new Solution();
    int passed = 0;
    ArrayList<String> testResults = new ArrayList<>();
${cases
  .map((testCase, index) => {
    const declarations = testCase.input.map((value, argIndex) => (Array.isArray(value) ? `    var arg${index}_${argIndex} = ${javaLiteral(value)};` : "")).filter(Boolean).join("\n");
    const args = testCase.input.map((value, argIndex) => (Array.isArray(value) ? `arg${index}_${argIndex}` : javaLiteral(value))).join(", ");
    const input = JSON.stringify(JSON.stringify(testCase.input));
    const expected = JSON.stringify(JSON.stringify(testCase.expected));
    return `    try {
${declarations}
      var result${index} = solution.${functionName}(${args});
      String actual${index} = toJson(result${index});
      String expected${index} = ${expected};
      if(!sameJson(actual${index}, expected${index})){
        testResults.add("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Wrong Answer\\",\\"input\\":" + ${input} + ",\\"expected\\":" + expected${index} + ",\\"actual\\":" + actual${index} + ",\\"runtimeMs\\":1,\\"memoryMb\\":96,\\"message\\":\\"Expected " + expected${index} + ", but received " + actual${index} + ".\\"}");
        System.out.println("{\\"status\\":\\"Wrong Answer\\",\\"passed\\":" + passed + ",\\"message\\":\\"Expected " + expected${index} + ", but received " + actual${index} + ".\\",\\"failedCase\\":{\\"input\\":" + ${input} + ",\\"expected\\":" + expected${index} + ",\\"actual\\":" + actual${index} + "},\\"testResults\\":[" + String.join(",", testResults) + "]}"); return; }
      testResults.add("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Accepted\\",\\"input\\":" + ${input} + ",\\"expected\\":" + expected${index} + ",\\"actual\\":" + actual${index} + ",\\"runtimeMs\\":1,\\"memoryMb\\":96}");
      passed++;
    } catch(Exception error){
      testResults.add("{\\"caseNumber\\":${index + 1},\\"status\\":\\"Runtime Error\\",\\"input\\":" + ${input} + ",\\"expected\\":" + ${expected} + ",\\"runtimeMs\\":1,\\"memoryMb\\":96,\\"message\\":\\"Java solution threw an exception.\\"}");
      System.out.println("{\\"status\\":\\"Runtime Error\\",\\"passed\\":${index},\\"message\\":\\"Java solution threw an exception.\\",\\"testResults\\":[" + String.join(",", testResults) + "]}"); return; }`;
  }).join("\n")}
    System.out.println("{\\"status\\":\\"Accepted\\",\\"passed\\":" + passed + ",\\"message\\":\\"All selected test cases passed.\\",\\"testResults\\":[" + String.join(",", testResults) + "]}");
  }
}
`;
}

async function runJava(code, cases, functionName) {
  const started = Date.now();
  const workDir = await createWorkDir();
  try {
    await writeFile(path.join(workDir, "Main.java"), javaHarness(code, functionName, cases));
    const result = await runProcess("docker", dockerArgs(JAVA_IMAGE, workDir, "javac Main.java && java Main"), TIMEOUT_MS);
    return parseDockerResult(result, cases.length, started, 96);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

function parseDockerResult(result, total, started, memoryMb) {
  const runtimeMs = Math.max(1, Date.now() - started);
  if (result.timedOut) return { status: "Runtime Error", passed: 0, total, runtimeMs, memoryMb, message: "Execution timed out." };
  if (result.code !== 0 && !result.stdout.trim()) {
    const stderr = result.stderr.trim();
    return { status: /SyntaxError|IndentationError|TabError|error:/.test(stderr) ? "Compilation Error" : "Runtime Error", passed: 0, total, runtimeMs, memoryMb, message: stderr || "Docker runner failed." };
  }
  try {
    const payload = JSON.parse(result.stdout.trim().split(/\r?\n/).at(-1) || "{}");
    return {
      status: payload.status || "Runtime Error",
      passed: Number(payload.passed || 0),
      total,
      runtimeMs,
      memoryMb,
      message: String(payload.message || "Runner completed."),
      failedCase: payload.failedCase,
      testResults: Array.isArray(payload.testResults) ? payload.testResults : undefined,
    };
  } catch {
    return { status: "Runtime Error", passed: 0, total, runtimeMs, memoryMb, message: result.stdout.trim() || "Runner returned invalid output." };
  }
}

async function judge(payload) {
  const cases = Array.isArray(payload.cases) ? payload.cases : [];
  const language = String(payload.language || "JavaScript");
  const code = String(payload.code || "");
  const functionName = String(payload.functionName || "");
  if (code.length > MAX_CODE_LENGTH) {
    return { status: "Compilation Error", passed: 0, total: cases.length, runtimeMs: 0, memoryMb: 0, message: `Code is too large. Limit is ${MAX_CODE_LENGTH} characters.` };
  }
  if (cases.length > MAX_CASES) {
    return { status: "Runtime Error", passed: 0, total: cases.length, runtimeMs: 0, memoryMb: 0, message: `Too many test cases. Limit is ${MAX_CASES}.` };
  }
  if (!cases.every((testCase) => Array.isArray(testCase?.input) && Object.hasOwn(testCase, "expected"))) {
    return { status: "Runtime Error", passed: 0, total: cases.length, runtimeMs: 0, memoryMb: 0, message: "Invalid test case format." };
  }
  if (!functionName) return { status: "Compilation Error", passed: 0, total: cases.length, runtimeMs: 0, memoryMb: 0, message: "functionName is required." };
  if (language === "JavaScript") return runJavaScript(code, cases, functionName);
  if (language === "Python") return runPython(code, cases, functionName);
  if (language === "C++") return runCpp(code, cases, functionName);
  if (language === "Java") return runJava(code, cases, functionName);
  return { status: "Compilation Error", passed: 0, total: cases.length, runtimeMs: 0, memoryMb: 0, message: `${language} is not supported.` };
}

const server = http.createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true, runner: "wohotech-judge-worker" });
    return;
  }

  if (request.method !== "POST" || request.url !== "/judge") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  if (!isAuthorized(request)) {
    sendJson(response, 401, { error: "Unauthorized" });
    return;
  }

  try {
    const payload = await readJson(request);
    sendJson(response, 200, await judge(payload));
  } catch (error) {
    sendJson(response, 400, { status: "Runtime Error", passed: 0, total: 0, runtimeMs: 0, memoryMb: 0, message: error.message });
  }
});

server.headersTimeout = TIMEOUT_MS + 5_000;
server.requestTimeout = TIMEOUT_MS + 5_000;

server.listen(PORT, () => {
  console.log(`[judge-worker] listening on http://localhost:${PORT}`);
  if (!TOKEN) {
    console.warn(
      REQUIRE_TOKEN
        ? "[judge-worker] JUDGE_SERVICE_TOKEN is required in production; /judge will reject requests."
        : "[judge-worker] JUDGE_SERVICE_TOKEN is not set; requests are unauthenticated.",
    );
  }
});
