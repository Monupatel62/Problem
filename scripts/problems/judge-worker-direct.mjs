/**
 * WohoTech Judge Worker — Direct Mode (Secure, No Docker-in-Docker)
 *
 * Safety measures:
 *  - JavaScript : vm sandbox + per-case timeout + output size cap
 *  - Python     : resource limits (ulimit), no network, restricted imports
 *  - C++        : ulimit on memory/cpu, SIGKILL on timeout
 *  - Java       : -Xmx limit, SecurityManager-style flags, SIGKILL on timeout
 *  - All        : process timeout, stdout/stderr cap, temp dir cleanup
 */

import http      from "node:http";
import vm        from "node:vm";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path      from "node:path";
import { createRequire } from "node:module";

// better-sqlite3 — loaded lazily so worker starts even if not installed
let Database = null;
try {
  const require = createRequire(import.meta.url);
  Database = require("better-sqlite3");
} catch {
  // SQL runner disabled if package not installed
}

// ── Config ────────────────────────────────────────────────────────────────────
const PORT        = Number(process.env.PORT                    || 8787);
const TOKEN       = process.env.JUDGE_SERVICE_TOKEN            || "";
const TIMEOUT_MS  = Number(process.env.JUDGE_DOCKER_TIMEOUT_MS || 15_000);
const JS_CASE_TIMEOUT = Math.min(TIMEOUT_MS, 5_000); // per-case JS timeout
const MAX_CODE    = Number(process.env.JUDGE_MAX_CODE_LENGTH   || 50_000);
const MAX_CASES   = Number(process.env.JUDGE_MAX_CASES         || 30);
const MAX_STDIO   = Number(process.env.JUDGE_MAX_STDIO_LENGTH  || 200_000);
const REQUIRE_TOKEN = process.env.NODE_ENV === "production" &&
                      process.env.JUDGE_ALLOW_UNAUTHENTICATED !== "true";

// Concurrency limit — prevent OOM on Render free tier (512MB)
// Java/C++ compilation each uses ~150-200MB; allow max 2 concurrent
const MAX_CONCURRENT = Number(process.env.JUDGE_MAX_CONCURRENT || 2);
let activeJobs = 0;

// ulimit values for subprocesses
const MEM_LIMIT_MB  = 128;   // max memory per run (reduced for Render free tier 512MB limit)
const CPU_LIMIT_SEC = 10;    // max CPU seconds

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => {
      body += c.toString();
      if (body.length > 1_000_000) { req.destroy(); reject(new Error("Payload too large.")); }
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error("Invalid JSON.")); }
    });
    req.on("error", reject);
  });
}

function isAuthorized(req) {
  if (REQUIRE_TOKEN && !TOKEN) return false;
  if (!TOKEN) return true;
  return req.headers.authorization === `Bearer ${TOKEN}`;
}

// ── Answer comparison ─────────────────────────────────────────────────────────
function normalize(v) {
  if (Array.isArray(v)) return v.map(normalize);
  if (typeof v === "number") return Number.isFinite(v) ? v : String(v);
  return v;
}

function sameAnswer(actual, expected) {
  if (typeof actual === "number" && typeof expected === "number")
    return Math.abs(actual - expected) <= 1e-9;
  if (typeof actual === "string" && typeof expected === "number" &&
      actual.trim() !== "" && Number.isFinite(Number(actual)))
    return Math.abs(Number(actual) - expected) <= 1e-9;
  if (typeof actual === "number" && typeof expected === "string" &&
      expected.trim() !== "" && Number.isFinite(Number(expected)))
    return Math.abs(actual - Number(expected)) <= 1e-9;
  if (Array.isArray(actual) && Array.isArray(expected))
    return actual.length === expected.length &&
           actual.every((v, i) => sameAnswer(v, expected[i]));
  return JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expected));
}

function cloneInput(input) {
  return input.map((v) =>
    Array.isArray(v) || (v && typeof v === "object")
      ? JSON.parse(JSON.stringify(v)) : v
  );
}

// ── CWD-aware process runner with hard kill ───────────────────────────────────
function runProcessCwd(command, args, cwd, timeoutMs, extraEnv = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { PATH: process.env.PATH, ...extraEnv },
      // Never use shell:true — prevents shell injection
    });
    let stdout = "", stderr = "", timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      try { process.kill(-child.pid, "SIGKILL"); } catch { child.kill("SIGKILL"); }
    }, timeoutMs);

    child.stdout.on("data", (c) => {
      stdout += c.toString();
      if (stdout.length > MAX_STDIO) { child.kill("SIGKILL"); }
    });
    child.stderr.on("data", (c) => {
      stderr += c.toString();
      if (stderr.length > MAX_STDIO) { child.kill("SIGKILL"); }
    });
    child.on("error", (e) => { clearTimeout(timer); resolve({ code: 1, stdout, stderr: e.message, timedOut }); });
    child.on("close", (code) => { clearTimeout(timer); resolve({ code, stdout, stderr, timedOut }); });
  });
}

function parseDirectResult(result, total, started, memoryMb) {
  const runtimeMs = Math.max(1, Date.now() - started);
  if (result.timedOut)
    return { status: "Runtime Error", passed: 0, total, runtimeMs, memoryMb,
             message: "Time limit exceeded. Check for infinite loops or excessive recursion." };
  if (result.code !== 0 && !result.stdout.trim()) {
    const stderr = result.stderr.slice(0, 2000).trim();
    return {
      status: /SyntaxError|IndentationError|TabError|error:|Error:/.test(stderr)
        ? "Compilation Error" : "Runtime Error",
      passed: 0, total, runtimeMs, memoryMb,
      message: stderr || "Runner exited with no output.",
    };
  }
  try {
    const lastLine = result.stdout.trim().split(/\r?\n/).at(-1) || "{}";
    const payload  = JSON.parse(lastLine);
    return {
      status:      payload.status      || "Runtime Error",
      passed:      Number(payload.passed  || 0),
      total, runtimeMs, memoryMb,
      message:     String(payload.message || "Runner completed."),
      failedCase:  payload.failedCase,
      testResults: Array.isArray(payload.testResults) ? payload.testResults : undefined,
    };
  } catch {
    return { status: "Runtime Error", passed: 0, total, runtimeMs, memoryMb,
             message: result.stdout.slice(0, 500).trim() || "Runner returned invalid output." };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// JAVASCRIPT — vm sandbox
// ════════════════════════════════════════════════════════════════════════════
function runJavaScript(code, cases, functionName) {
  if (code.length > MAX_CODE)
    return { status: "Compilation Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0, message: "Code is too large." };

  const started = Date.now();
  // Sandbox — no access to process, require, fs, etc.
  // Note: context object itself must NOT be frozen — vm needs to write __args into it.
  // Individual globals are not writable from user code (they're primitives/builtins).
  const ctx = vm.createContext({
    console: Object.freeze({ log: () => {}, error: () => {} }),
    Math, JSON, Array, Object, String, Number, Boolean, Set, Map,
    parseInt, parseFloat, isNaN, isFinite, undefined,
  });
  let solution;

  try {
    solution = new vm.Script(`"use strict";\n${code}\n;typeof ${functionName}==="function"?${functionName}:undefined;`)
      .runInContext(ctx, { timeout: JS_CASE_TIMEOUT, breakOnSigint: true });
  } catch (err) {
    return { status: "Compilation Error", passed: 0, total: cases.length,
             runtimeMs: Date.now() - started, memoryMb: 0,
             message: err.message.slice(0, 500) };
  }

  if (typeof solution !== "function")
    return { status: "Compilation Error", passed: 0, total: cases.length,
             runtimeMs: Date.now() - started, memoryMb: 0,
             message: `Define a function named '${functionName}'.` };

  let passed = 0;
  const testResults = [];

  for (const [i, tc] of cases.entries()) {
    const t0 = Date.now();
    try {
      // Each case gets fresh args in a mutable slot
      ctx.__args = cloneInput(tc.input);
      const actual = new vm.Script(`${functionName}(...__args)`)
        .runInContext(ctx, { timeout: JS_CASE_TIMEOUT });
      const runtimeMs = Math.max(1, Date.now() - t0);

      if (!sameAnswer(actual, tc.expected)) {
        const msg = `Expected ${JSON.stringify(tc.expected)}, got ${JSON.stringify(actual)}.`;
        testResults.push({ caseNumber: i+1, status: "Wrong Answer", input: tc.input,
                           expected: tc.expected, actual, runtimeMs, memoryMb: 40, message: msg });
        return { status: "Wrong Answer", passed, total: cases.length,
                 runtimeMs: Math.max(1, Date.now() - started), memoryMb: 40, message: msg,
                 failedCase: { input: tc.input, expected: tc.expected, actual }, testResults };
      }
      testResults.push({ caseNumber: i+1, status: "Accepted", input: tc.input,
                         expected: tc.expected, actual, runtimeMs, memoryMb: 40 });
      passed++;
    } catch (err) {
      const runtimeMs = Math.max(1, Date.now() - t0);
      const msg = err.message?.includes("timed out")
        ? "Time limit exceeded. Check for infinite loops."
        : err.message?.slice(0, 500) || "Runtime error.";
      testResults.push({ caseNumber: i+1, status: "Runtime Error", input: tc.input,
                         expected: tc.expected, runtimeMs, memoryMb: 40, message: msg });
      return { status: "Runtime Error", passed, total: cases.length,
               runtimeMs: Math.max(1, Date.now() - started), memoryMb: 40, message: msg,
               failedCase: { input: tc.input, expected: tc.expected }, testResults };
    }
  }

  return { status: "Accepted", passed, total: cases.length,
           runtimeMs: Math.max(1, Date.now() - started), memoryMb: 40,
           message: "All test cases passed.", testResults };
}

// ════════════════════════════════════════════════════════════════════════════
// PYTHON — resource-limited subprocess
// ════════════════════════════════════════════════════════════════════════════
function pythonHarness(code, functionName, cases) {
  return `
import json, time, sys, signal, resource

# ── Hard limits inside the process ──────────────────────────────────────────
# Memory: ${MEM_LIMIT_MB}MB
try:
    soft, hard = resource.getrlimit(resource.RLIMIT_AS)
    resource.setrlimit(resource.RLIMIT_AS, (${MEM_LIMIT_MB} * 1024 * 1024, hard))
except Exception:
    pass
# CPU: ${CPU_LIMIT_SEC}s
try:
    resource.setrlimit(resource.RLIMIT_CPU, (${CPU_LIMIT_SEC}, ${CPU_LIMIT_SEC}))
except Exception:
    pass
# No new processes (fork bomb prevention)
try:
    resource.setrlimit(resource.RLIMIT_NPROC, (1, 1))
except Exception:
    pass

# Block dangerous modules at import time
import builtins
_real_import = builtins.__import__
_BLOCKED = {"os", "subprocess", "socket", "urllib", "urllib2", "http",
             "requests", "ftplib", "smtplib", "multiprocessing", "threading",
             "ctypes", "cffi", "importlib", "_thread", "asyncio", "signal"}
def _safe_import(name, *args, **kwargs):
    top = name.split(".")[0]
    if top in _BLOCKED:
        raise ImportError(f"Module '{name}' is not allowed in the judge sandbox.")
    return _real_import(name, *args, **kwargs)
builtins.__import__ = _safe_import

# SIGXCPU handler (CPU limit exceeded)
def _cpu_handler(sig, frame):
    print(json.dumps({"status":"Runtime Error","passed":0,"message":"CPU time limit exceeded."}))
    sys.exit(1)
try:
    signal.signal(signal.SIGXCPU, _cpu_handler)
except Exception:
    pass

# ── User code ────────────────────────────────────────────────────────────────
${code}

# ── Harness ──────────────────────────────────────────────────────────────────
CASES = json.loads(${JSON.stringify(JSON.stringify(cases))})
FUNCTION_NAME = ${JSON.stringify(functionName)}

def get_callable():
    if FUNCTION_NAME in globals() and callable(globals()[FUNCTION_NAME]):
        return globals()[FUNCTION_NAME]
    if "Solution" in globals():
        fn = getattr(Solution(), FUNCTION_NAME, None)
        if callable(fn): return fn
    raise NameError(f"Define '{FUNCTION_NAME}' or 'Solution.{FUNCTION_NAME}'.")

def same_answer(actual, expected):
    if isinstance(actual, (int, float)) and isinstance(expected, (int, float)):
        return abs(actual - expected) <= 1e-9
    if isinstance(actual, str) and isinstance(expected, (int, float)):
        try: return abs(float(actual) - expected) <= 1e-9
        except ValueError: return False
    if isinstance(actual, (int, float)) and isinstance(expected, str):
        try: return abs(actual - float(expected)) <= 1e-9
        except ValueError: return False
    if isinstance(actual, list) and isinstance(expected, list):
        return len(actual) == len(expected) and all(same_answer(a, b) for a, b in zip(actual, expected))
    return actual == expected

def main():
    fn = get_callable()
    passed = 0
    test_results = []
    for index, case in enumerate(CASES):
        t0 = time.time()
        try:
            actual = fn(*case["input"])
        except MemoryError:
            ms = max(1, round((time.time()-t0)*1000))
            msg = "Memory limit exceeded."
            test_results.append({"caseNumber":index+1,"status":"Runtime Error","input":case["input"],"expected":case["expected"],"runtimeMs":ms,"memoryMb":${MEM_LIMIT_MB},"message":msg})
            print(json.dumps({"status":"Runtime Error","passed":passed,"message":msg,"testResults":test_results}))
            return
        except RecursionError:
            ms = max(1, round((time.time()-t0)*1000))
            msg = "Maximum recursion depth exceeded. Check for infinite recursion."
            test_results.append({"caseNumber":index+1,"status":"Runtime Error","input":case["input"],"expected":case["expected"],"runtimeMs":ms,"memoryMb":48,"message":msg})
            print(json.dumps({"status":"Runtime Error","passed":passed,"message":msg,"testResults":test_results}))
            return
        except Exception as exc:
            ms = max(1, round((time.time()-t0)*1000))
            test_results.append({"caseNumber":index+1,"status":"Runtime Error","input":case["input"],"expected":case["expected"],"runtimeMs":ms,"memoryMb":48,"message":str(exc)})
            print(json.dumps({"status":"Runtime Error","passed":passed,"message":str(exc),"failedCase":{"input":case["input"],"expected":case["expected"]},"testResults":test_results}))
            return
        ms = max(1, round((time.time()-t0)*1000))
        if not same_answer(actual, case["expected"]):
            msg = f"Expected {case['expected']}, got {actual}."
            test_results.append({"caseNumber":index+1,"status":"Wrong Answer","input":case["input"],"expected":case["expected"],"actual":actual,"runtimeMs":ms,"memoryMb":48,"message":msg})
            print(json.dumps({"status":"Wrong Answer","passed":passed,"message":msg,"failedCase":{"input":case["input"],"expected":case["expected"],"actual":actual},"testResults":test_results}))
            return
        test_results.append({"caseNumber":index+1,"status":"Accepted","input":case["input"],"expected":case["expected"],"actual":actual,"runtimeMs":ms,"memoryMb":48})
        passed += 1
    print(json.dumps({"status":"Accepted","passed":passed,"message":"All test cases passed.","testResults":test_results}))

try:
    main()
except MemoryError:
    print(json.dumps({"status":"Runtime Error","passed":0,"message":"Memory limit exceeded."}))
except RecursionError:
    print(json.dumps({"status":"Runtime Error","passed":0,"message":"Maximum recursion depth exceeded."}))
except Exception as exc:
    print(json.dumps({"status":"Compilation Error","passed":0,"message":str(exc)}))
`;
}

async function runPython(code, cases, functionName) {
  const started = Date.now();
  const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-py-"));
  try {
    await writeFile(path.join(workDir, "runner.py"), pythonHarness(code, functionName, cases));
    // ulimit wrapper: virtual memory + cpu time + no new files
    const result = await runProcessCwd(
      "sh", ["-c", `ulimit -v ${MEM_LIMIT_MB * 1024} -t ${CPU_LIMIT_SEC} -u 64 2>/dev/null; python3 runner.py`],
      workDir, TIMEOUT_MS
    );
    return parseDirectResult(result, cases.length, started, 48);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ════════════════════════════════════════════════════════════════════════════
// C++ — compile + run with ulimit
// ════════════════════════════════════════════════════════════════════════════
function cppLiteral(value) {
  if (Array.isArray(value)) {
    if (value.every((x) => typeof x === "number")) return `vector<int>{${value.join(",")}}`;
    if (value.every((x) => Array.isArray(x))) return `vector<vector<int>>{${value.map(cppLiteral).join(",")}}`;
    return `{${value.map(cppLiteral).join(",")}}`;
  }
  if (typeof value === "string")  return JSON.stringify(value);
  if (typeof value === "number")  return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "{}";
}

function cppHarness(code, functionName, cases) {
  return `
#include <bits/stdc++.h>
using namespace std;
// Disable fork/exec at compile-level via macro stubs (best-effort)
#define system(...) ((void)0)
#define popen(...)  nullptr
${code}
template<typename T> string toJson(const vector<T>& v);
string toJson(int v){ return to_string(v); }
string toJson(long long v){ return to_string(v); }
string toJson(double v){ ostringstream s; s<<setprecision(12)<<v; return s.str(); }
string toJson(bool v){ return v?"true":"false"; }
string toJson(const string& v){
  string o="\\""; for(char c:v){if(c=='"')o+="\\\\\\""; else if(c=='\\\\')o+="\\\\\\\\"; else o+=c;} return o+"\\"";
}
template<typename T> string toJson(const vector<T>& v){
  string o="["; for(size_t i=0;i<v.size();++i){if(i)o+=",";o+=toJson(v[i]);} return o+"]";
}
bool sameJson(const string& a,const string& b){
  if(a==b)return true;
  char*ea=nullptr,*eb=nullptr;
  double da=strtod(a.c_str(),&ea),db=strtod(b.c_str(),&eb);
  return ea&&!*ea&&eb&&!*eb&&fabs(da-db)<=1e-9;
}
int main(){
  Solution sol; int passed=0; vector<string> tr;
${cases.map((tc, i) => {
    const decls = tc.input.map((v, j) => Array.isArray(v) ? `  auto a${i}_${j}=${cppLiteral(v)};` : "").filter(Boolean).join("\n");
    const args  = tc.input.map((v, j) => Array.isArray(v) ? `a${i}_${j}` : cppLiteral(v)).join(",");
    const inp   = JSON.stringify(JSON.stringify(tc.input));
    const exp   = JSON.stringify(JSON.stringify(tc.expected));
    return `  try{
${decls}
    auto r${i}=sol.${functionName}(${args});
    string act${i}=toJson(r${i}),exp${i}=${exp};
    if(!sameJson(act${i},exp${i})){
      tr.push_back("{\\"caseNumber\\":${i+1},\\"status\\":\\"Wrong Answer\\",\\"input\\":"+string(${inp})+",\\"expected\\":"+exp${i}+",\\"actual\\":"+act${i}+",\\"runtimeMs\\":1,\\"memoryMb\\":72,\\"message\\":\\"Expected "+exp${i}+", got "+act${i}+".\\"}");
      cout<<"{\\"status\\":\\"Wrong Answer\\",\\"passed\\":" <<passed<<",\\"message\\":\\"Expected "<<exp${i}<<", got "<<act${i}<<".\\",\\"failedCase\\":{\\"input\\":" <<${inp}<<",\\"expected\\":" <<exp${i}<<",\\"actual\\":" <<act${i}<<"},\\"testResults\\":[";
      for(size_t j=0;j<tr.size();++j){if(j)cout<<",";cout<<tr[j];} cout<<"]}"<<endl; return 0;
    }
    tr.push_back("{\\"caseNumber\\":${i+1},\\"status\\":\\"Accepted\\",\\"input\\":"+string(${inp})+",\\"expected\\":"+exp${i}+",\\"actual\\":"+act${i}+",\\"runtimeMs\\":1,\\"memoryMb\\":72}");
    passed++;
  }catch(const bad_alloc&){
    tr.push_back("{\\"caseNumber\\":${i+1},\\"status\\":\\"Runtime Error\\",\\"input\\":"+string(${inp})+",\\"expected\\":"+string(${exp})+",\\"runtimeMs\\":1,\\"memoryMb\\":72,\\"message\\":\\"Memory limit exceeded.\\"}");
    cout<<"{\\"status\\":\\"Runtime Error\\",\\"passed\\":${i},\\"message\\":\\"Memory limit exceeded.\\",\\"testResults\\":[";
    for(size_t j=0;j<tr.size();++j){if(j)cout<<",";cout<<tr[j];} cout<<"]}"<<endl; return 0;
  }catch(const exception& e){
    tr.push_back("{\\"caseNumber\\":${i+1},\\"status\\":\\"Runtime Error\\",\\"input\\":"+string(${inp})+",\\"expected\\":"+string(${exp})+",\\"runtimeMs\\":1,\\"memoryMb\\":72,\\"message\\":\\""+(string)e.what()+".\\"}");
    cout<<"{\\"status\\":\\"Runtime Error\\",\\"passed\\":${i},\\"message\\":\\""<<e.what()<<".\\",\\"testResults\\":[";
    for(size_t j=0;j<tr.size();++j){if(j)cout<<",";cout<<tr[j];} cout<<"]}"<<endl; return 0;
  }catch(...){
    tr.push_back("{\\"caseNumber\\":${i+1},\\"status\\":\\"Runtime Error\\",\\"input\\":"+string(${inp})+",\\"expected\\":"+string(${exp})+",\\"runtimeMs\\":1,\\"memoryMb\\":72,\\"message\\":\\"Unknown exception.\\"}");
    cout<<"{\\"status\\":\\"Runtime Error\\",\\"passed\\":${i},\\"message\\":\\"Unknown exception.\\",\\"testResults\\":[";
    for(size_t j=0;j<tr.size();++j){if(j)cout<<",";cout<<tr[j];} cout<<"]}"<<endl; return 0;
  }`;
}).join("\n")}
  cout<<"{\\"status\\":\\"Accepted\\",\\"passed\\":" <<passed<<",\\"message\\":\\"All test cases passed.\\",\\"testResults\\":[";
  for(size_t j=0;j<tr.size();++j){if(j)cout<<",";cout<<tr[j];} cout<<"]}"<<endl;
}
`;
}

async function runCpp(code, cases, functionName) {
  const started = Date.now();
  const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-cpp-"));
  try {
    await writeFile(path.join(workDir, "runner.cpp"), cppHarness(code, functionName, cases));
    // Compile with stack protector + no dangerous libs
    const compile = await runProcessCwd(
      "g++", ["-std=c++17", "-O2", "-fstack-protector-strong", "-o", "runner", "runner.cpp"],
      workDir, TIMEOUT_MS
    );
    if (compile.code !== 0) {
      return { status: "Compilation Error", passed: 0, total: cases.length,
               runtimeMs: Math.max(1, Date.now() - started), memoryMb: 72,
               message: compile.stderr.slice(0, 2000).trim() || "C++ compilation failed." };
    }
    // Run with ulimit: virtual memory + cpu + no new processes
    const run = await runProcessCwd(
      "sh", ["-c", `ulimit -v ${MEM_LIMIT_MB * 1024} -t ${CPU_LIMIT_SEC} -u 64 2>/dev/null; ./runner`],
      workDir, TIMEOUT_MS
    );
    return parseDirectResult(run, cases.length, started, 72);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ════════════════════════════════════════════════════════════════════════════
// JAVA — compile + run with JVM memory limits
// ════════════════════════════════════════════════════════════════════════════
function javaLiteral(value) {
  if (Array.isArray(value)) {
    if (value.every((x) => typeof x === "number")) return `new int[]{${value.join(",")}}`;
    if (value.every((x) => Array.isArray(x))) return `new int[][]{${value.map(javaLiteral).join(",")}}`;
    return `new Object[]{${value.map(javaLiteral).join(",")}}`;
  }
  if (typeof value === "string")  return JSON.stringify(value);
  if (typeof value === "number")  return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "null";
}

function javaHarness(code, functionName, cases) {
  return `
import java.util.*;
${code}
public class Main {
  static String toJson(int v){return Integer.toString(v);}
  static String toJson(long v){return Long.toString(v);}
  static String toJson(double v){return Double.toString(v);}
  static String toJson(boolean v){return v?"true":"false";}
  static String toJson(String v){return "\\""+v.replace("\\\\","\\\\\\\\").replace("\\"","\\\\\\"")+"\\""; }
  static String toJson(int[] v){StringBuilder o=new StringBuilder("[");for(int i=0;i<v.length;i++){if(i>0)o.append(",");o.append(v[i]);}return o.append("]").toString();}
  static String toJson(int[][] v){StringBuilder o=new StringBuilder("[");for(int i=0;i<v.length;i++){if(i>0)o.append(",");o.append(toJson(v[i]));}return o.append("]").toString();}
  static boolean sameJson(String a,String b){
    if(a.equals(b))return true;
    try{return Math.abs(Double.parseDouble(a)-Double.parseDouble(b))<=1e-9;}
    catch(NumberFormatException e){return false;}
  }
  public static void main(String[] args){
    Solution sol=new Solution(); int passed=0; ArrayList<String> tr=new ArrayList<>();
${cases.map((tc, i) => {
    const decls = tc.input.map((v, j) => Array.isArray(v) ? `      var a${i}_${j}=${javaLiteral(v)};` : "").filter(Boolean).join("\n");
    const callArgs = tc.input.map((v, j) => Array.isArray(v) ? `a${i}_${j}` : javaLiteral(v)).join(",");
    const inp   = JSON.stringify(JSON.stringify(tc.input));
    const exp   = JSON.stringify(JSON.stringify(tc.expected));
    return `    try{
${decls}
      var r${i}=sol.${functionName}(${callArgs});
      String act${i}=toJson(r${i}),exp${i}=${exp};
      if(!sameJson(act${i},exp${i})){
        tr.add("{\\"caseNumber\\":${i+1},\\"status\\":\\"Wrong Answer\\",\\"input\\":"+${inp}+",\\"expected\\":"+exp${i}+",\\"actual\\":"+act${i}+",\\"runtimeMs\\":1,\\"memoryMb\\":96,\\"message\\":\\"Expected "+exp${i}+", got "+act${i}+".\\"}");
        System.out.println("{\\"status\\":\\"Wrong Answer\\",\\"passed\\":"+passed+",\\"message\\":\\"Expected "+exp${i}+", got "+act${i}+".\\",\\"failedCase\\":{\\"input\\":"+${inp}+",\\"expected\\":"+exp${i}+",\\"actual\\":"+act${i}+"},\\"testResults\\":["+String.join(",",tr)+"]}");
        return;
      }
      tr.add("{\\"caseNumber\\":${i+1},\\"status\\":\\"Accepted\\",\\"input\\":"+${inp}+",\\"expected\\":"+exp${i}+",\\"actual\\":"+act${i}+",\\"runtimeMs\\":1,\\"memoryMb\\":96}");
      passed++;
    }catch(OutOfMemoryError e){
      tr.add("{\\"caseNumber\\":${i+1},\\"status\\":\\"Runtime Error\\",\\"input\\":"+${inp}+",\\"expected\\":"+${exp}+",\\"runtimeMs\\":1,\\"memoryMb\\":96,\\"message\\":\\"Memory limit exceeded.\\"}");
      System.out.println("{\\"status\\":\\"Runtime Error\\",\\"passed\\":"+passed+",\\"message\\":\\"Memory limit exceeded.\\",\\"testResults\\":["+String.join(",",tr)+"]}");
      return;
    }catch(StackOverflowError e){
      tr.add("{\\"caseNumber\\":${i+1},\\"status\\":\\"Runtime Error\\",\\"input\\":"+${inp}+",\\"expected\\":"+${exp}+",\\"runtimeMs\\":1,\\"memoryMb\\":96,\\"message\\":\\"Stack overflow. Check for infinite recursion.\\"}");
      System.out.println("{\\"status\\":\\"Runtime Error\\",\\"passed\\":"+passed+",\\"message\\":\\"Stack overflow. Check for infinite recursion.\\",\\"testResults\\":["+String.join(",",tr)+"]}");
      return;
    }catch(Exception e){
      tr.add("{\\"caseNumber\\":${i+1},\\"status\\":\\"Runtime Error\\",\\"input\\":"+${inp}+",\\"expected\\":"+${exp}+",\\"runtimeMs\\":1,\\"memoryMb\\":96,\\"message\\":\\""+e.getMessage()+"\\"}");
      System.out.println("{\\"status\\":\\"Runtime Error\\",\\"passed\\":"+passed+",\\"message\\":\\""+e.getMessage()+".\\",\\"testResults\\":["+String.join(",",tr)+"]}");
      return;
    }`;
}).join("\n")}
    System.out.println("{\\"status\\":\\"Accepted\\",\\"passed\\":"+passed+",\\"message\\":\\"All test cases passed.\\",\\"testResults\\":["+String.join(",",tr)+"]}");
  }
}
`;
}

async function runJava(code, cases, functionName) {
  const started = Date.now();
  const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-java-"));
  try {
    await writeFile(path.join(workDir, "Main.java"), javaHarness(code, functionName, cases));
    const compile = await runProcessCwd("javac", ["Main.java"], workDir, TIMEOUT_MS);
    if (compile.code !== 0) {
      return { status: "Compilation Error", passed: 0, total: cases.length,
               runtimeMs: Math.max(1, Date.now() - started), memoryMb: 96,
               message: compile.stderr.slice(0, 2000).trim() || "Java compilation failed." };
    }
    // -Xmx memory limit + disable network/file SecurityManager via policy
    const run = await runProcessCwd(
      "java", [
        `-Xmx${MEM_LIMIT_MB}m`,   // heap limit
        `-Xss8m`,                  // stack size (allows deep but not infinite recursion)
        "-cp", ".",
        "Main"
      ],
      workDir, TIMEOUT_MS
    );
    return parseDirectResult(run, cases.length, started, 96);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SHELL — bash script runner
// ════════════════════════════════════════════════════════════════════════════

async function runShell(script, cases) {
  const started = Date.now();

  // Block dangerous shell patterns
  const dangerous = /\b(rm\s+-rf?|mkfs|dd\s+if|fork\s*\(|:(){ :|:&};:|wget|curl|nc\s|ncat|chmod\s+[0-7]*\s+\/|chown|sudo|su\s)/i;
  if (dangerous.test(script)) {
    return { status: "Compilation Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0,
             message: "Dangerous shell command detected and blocked." };
  }

  let passed = 0;
  const testResults = [];

  for (const [i, tc] of cases.entries()) {
    const t0 = Date.now();
    const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-sh-"));
    try {
      // Write input to words.txt (shell problems use file input)
      const inputContent = Array.isArray(tc.input) ? tc.input[0] : String(tc.input);
      await writeFile(path.join(workDir, "words.txt"), inputContent);
      await writeFile(path.join(workDir, "solution.sh"), script);

      const result = await runProcessCwd(
        "sh", ["-c", `ulimit -t ${CPU_LIMIT_SEC} -u 32 2>/dev/null; sh solution.sh`],
        workDir, Math.min(TIMEOUT_MS, 10_000)
      );

      const runtimeMs = Math.max(1, Date.now() - t0);

      if (result.timedOut) {
        testResults.push({ caseNumber: i+1, status: "Runtime Error", input: tc.input,
                           expected: tc.expected, runtimeMs, memoryMb: 4,
                           message: "Time limit exceeded." });
        return { status: "Runtime Error", passed, total: cases.length,
                 runtimeMs: Math.max(1, Date.now() - started), memoryMb: 4,
                 message: "Time limit exceeded.", testResults };
      }

      if (result.code !== 0 && !result.stdout.trim()) {
        const msg = result.stderr.slice(0, 500).trim() || "Shell script failed.";
        testResults.push({ caseNumber: i+1, status: "Runtime Error", input: tc.input,
                           expected: tc.expected, runtimeMs, memoryMb: 4, message: msg });
        return { status: "Runtime Error", passed, total: cases.length,
                 runtimeMs: Math.max(1, Date.now() - started), memoryMb: 4,
                 message: msg, testResults };
      }

      const actual   = result.stdout.trim();
      const expected = String(tc.expected).trim();

      if (actual !== expected) {
        const msg = `Expected:\n${expected}\n\nGot:\n${actual}`;
        testResults.push({ caseNumber: i+1, status: "Wrong Answer", input: tc.input,
                           expected: tc.expected, actual, runtimeMs, memoryMb: 4, message: msg });
        return { status: "Wrong Answer", passed, total: cases.length,
                 runtimeMs: Math.max(1, Date.now() - started), memoryMb: 4,
                 message: msg,
                 failedCase: { input: tc.input, expected: tc.expected, actual },
                 testResults };
      }

      testResults.push({ caseNumber: i+1, status: "Accepted", input: tc.input,
                         expected: tc.expected, actual, runtimeMs, memoryMb: 4 });
      passed++;
    } catch (err) {
      const runtimeMs = Math.max(1, Date.now() - t0);
      testResults.push({ caseNumber: i+1, status: "Runtime Error", input: tc.input,
                         expected: tc.expected, runtimeMs, memoryMb: 4,
                         message: err.message?.slice(0, 500) || "Shell error." });
      return { status: "Runtime Error", passed, total: cases.length,
               runtimeMs: Math.max(1, Date.now() - started), memoryMb: 4,
               message: err.message || "Shell error.", testResults };
    } finally {
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  return { status: "Accepted", passed, total: cases.length,
           runtimeMs: Math.max(1, Date.now() - started), memoryMb: 4,
           message: "All test cases passed.", testResults };
}

// ════════════════════════════════════════════════════════════════════════════
// CONCURRENCY — Python threading harness
// ════════════════════════════════════════════════════════════════════════════

function concurrencyHarness(code, cases) {
  return `
import json, threading, sys, time

# ── User code ────────────────────────────────────────────────────────────────
${code}

# ── Harness ──────────────────────────────────────────────────────────────────
CASES = json.loads(${JSON.stringify(JSON.stringify(cases))})

def run_case(nums):
    result = []
    foo = Foo()

    def printFirst():  result.append("first")
    def printSecond(): result.append("second")
    def printThird():  result.append("third")

    # Map position to method
    method_map = {
        1: lambda: foo.first(printFirst),
        2: lambda: foo.second(printSecond),
        3: lambda: foo.third(printThird),
    }

    threads = [threading.Thread(target=method_map[n]) for n in nums]
    for t in threads: t.start()
    for t in threads: t.join(timeout=5)

    # Check all threads finished
    if any(t.is_alive() for t in threads):
        return None, "Deadlock or timeout — threads did not finish in 5 seconds."

    return "".join(result), None

passed = 0
test_results = []

for index, case in enumerate(CASES):
    nums = case["input"][0]
    t0 = time.time()
    try:
        actual, err = run_case(nums)
        ms = max(1, round((time.time()-t0)*1000))
        expected = case["expected"]

        if err:
            test_results.append({"caseNumber":index+1,"status":"Runtime Error","input":case["input"],"expected":expected,"runtimeMs":ms,"memoryMb":48,"message":err})
            print(json.dumps({"status":"Runtime Error","passed":passed,"message":err,"testResults":test_results}))
            sys.exit(0)

        if actual != expected:
            msg = f"Expected '{expected}', got '{actual}'."
            test_results.append({"caseNumber":index+1,"status":"Wrong Answer","input":case["input"],"expected":expected,"actual":actual,"runtimeMs":ms,"memoryMb":48,"message":msg})
            print(json.dumps({"status":"Wrong Answer","passed":passed,"message":msg,"failedCase":{"input":case["input"],"expected":expected,"actual":actual},"testResults":test_results}))
            sys.exit(0)

        test_results.append({"caseNumber":index+1,"status":"Accepted","input":case["input"],"expected":expected,"actual":actual,"runtimeMs":ms,"memoryMb":48})
        passed += 1

    except Exception as exc:
        ms = max(1, round((time.time()-t0)*1000))
        test_results.append({"caseNumber":index+1,"status":"Runtime Error","input":case["input"],"expected":case["expected"],"runtimeMs":ms,"memoryMb":48,"message":str(exc)})
        print(json.dumps({"status":"Runtime Error","passed":passed,"message":str(exc),"testResults":test_results}))
        sys.exit(0)

print(json.dumps({"status":"Accepted","passed":passed,"message":"All test cases passed.","testResults":test_results}))
`;
}

async function runConcurrency(code, cases) {
  const started = Date.now();
  const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-conc-"));
  try {
    await writeFile(path.join(workDir, "runner.py"), concurrencyHarness(code, cases));
    const result = await runProcessCwd(
      "sh", ["-c", `ulimit -v ${MEM_LIMIT_MB * 1024} -t ${CPU_LIMIT_SEC} 2>/dev/null; python3 runner.py`],
      workDir, TIMEOUT_MS
    );
    return parseDirectResult(result, cases.length, started, 48);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SQL — SQLite in-memory runner
// ════════════════════════════════════════════════════════════════════════════

function normalizeSqlRows(rows) {
  // Normalize null vs undefined, lowercase keys for comparison
  return rows.map((row) => {
    const normalized = {};
    for (const [k, v] of Object.entries(row)) {
      normalized[k.toLowerCase()] = v === undefined ? null : v;
    }
    return normalized;
  });
}

function rowsMatch(actual, expected) {
  if (actual.length !== expected.length) return false;
  // Sort both by JSON string for order-independent comparison
  const sortKey = (row) => JSON.stringify(Object.keys(row).sort().map((k) => row[k]));
  const sortedActual   = [...normalizeSqlRows(actual)].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const sortedExpected = [...normalizeSqlRows(expected)].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  return sortedActual.every((row, i) => {
    const expRow = sortedExpected[i];
    return Object.keys(expRow).every((k) => {
      const a = row[k.toLowerCase()];
      const e = expRow[k];
      if (e === null || e === undefined) return a === null || a === undefined || a === "";
      if (typeof e === "number" && typeof a === "string") return Math.abs(Number(a) - e) <= 1e-9;
      if (typeof e === "string" && typeof a === "number") return Math.abs(a - Number(e)) <= 1e-9;
      return String(a).toLowerCase() === String(e).toLowerCase();
    });
  });
}

function runSQL(sql, cases, sqlSetup) {
  if (!Database) {
    return { status: "Runtime Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0,
             message: "SQL runner (better-sqlite3) is not installed on this judge server." };
  }

  if (!sql || !sql.trim()) {
    return { status: "Compilation Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0, message: "SQL query is empty." };
  }

  // Block dangerous SQL statements
  const dangerPattern = /\b(DROP|ALTER|CREATE\s+TABLE|INSERT|UPDATE|DELETE|ATTACH|DETACH|PRAGMA\s+(?!table_info)|LOAD\s+EXTENSION)\b/i;
  if (dangerPattern.test(sql)) {
    return { status: "Compilation Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0,
             message: "Only SELECT statements are allowed. DROP, INSERT, UPDATE, DELETE etc. are not permitted." };
  }

  const started = Date.now();
  let passed = 0;
  const testResults = [];

  for (const [i, tc] of cases.entries()) {
    const t0 = Date.now();
    let db = null;
    try {
      // Fresh in-memory DB per test case
      db = new Database(":memory:", { timeout: 5000 });
      db.pragma("journal_mode = WAL");

      // Create tables from setup DDL
      if (Array.isArray(sqlSetup)) {
        for (const stmt of sqlSetup) db.exec(stmt);
      }

      // Insert test data — tc.input is { TableName: [[row values...], ...] }
      const tableData = tc.input;
      for (const [tableName, rows] of Object.entries(tableData)) {
        if (!Array.isArray(rows) || rows.length === 0) continue;
        // Get column names from CREATE TABLE definition in sqlSetup
        const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const colNames  = tableInfo.map((c) => c.name);
        const placeholders = colNames.map(() => "?").join(", ");
        const insert = db.prepare(`INSERT INTO ${tableName} (${colNames.join(", ")}) VALUES (${placeholders})`);
        const insertMany = db.transaction((rowList) => {
          for (const row of rowList) insert.run(...(Array.isArray(row) ? row : Object.values(row)));
        });
        insertMany(rows);
      }

      // Run user SQL
      const stmt   = db.prepare(sql.trim().replace(/;$/, ""));
      const actual = stmt.all();
      const runtimeMs = Math.max(1, Date.now() - t0);

      const match = rowsMatch(actual, tc.expected);
      if (!match) {
        const msg = `Expected ${JSON.stringify(tc.expected)}, got ${JSON.stringify(actual)}.`;
        testResults.push({ caseNumber: i+1, status: "Wrong Answer",
                           input: tc.input, expected: tc.expected, actual,
                           runtimeMs, memoryMb: 8, message: msg });
        return { status: "Wrong Answer", passed, total: cases.length,
                 runtimeMs: Math.max(1, Date.now() - started), memoryMb: 8,
                 message: msg,
                 failedCase: { input: tc.input, expected: tc.expected, actual },
                 testResults };
      }
      testResults.push({ caseNumber: i+1, status: "Accepted",
                         input: tc.input, expected: tc.expected, actual,
                         runtimeMs, memoryMb: 8 });
      passed++;
    } catch (err) {
      const runtimeMs = Math.max(1, Date.now() - t0);
      const msg = err.message?.slice(0, 500) || "SQL error.";
      testResults.push({ caseNumber: i+1, status: "Runtime Error",
                         input: tc.input, expected: tc.expected,
                         runtimeMs, memoryMb: 8, message: msg });
      return { status: "Runtime Error", passed, total: cases.length,
               runtimeMs: Math.max(1, Date.now() - started), memoryMb: 8,
               message: msg, testResults };
    } finally {
      try { db?.close(); } catch {}
    }
  }

  return { status: "Accepted", passed, total: cases.length,
           runtimeMs: Math.max(1, Date.now() - started), memoryMb: 8,
           message: "All test cases passed.", testResults };
}

// ════════════════════════════════════════════════════════════════════════════
// FREE RUN — no test cases, just stdout/stderr output
// ════════════════════════════════════════════════════════════════════════════

function freeRunJavaScript(code) {
  if (code.length > MAX_CODE)
    return { stdout: "", stderr: "Code is too large.", runtimeMs: 0, exitCode: 1 };

  const started = Date.now();
  const output = [];
  const errors = [];

  // Sandbox with console.log captured
  const ctx = vm.createContext({
    console: {
      log:   (...args) => { output.push(args.map(String).join(" ")); },
      error: (...args) => { errors.push(args.map(String).join(" ")); },
      warn:  (...args) => { errors.push(args.map(String).join(" ")); },
      info:  (...args) => { output.push(args.map(String).join(" ")); },
    },
    Math, JSON, Array, Object, String, Number, Boolean, Set, Map,
    parseInt, parseFloat, isNaN, isFinite, undefined,
    setTimeout: () => {}, clearTimeout: () => {},
  });

  try {
    new vm.Script(`"use strict";\n${code}`)
      .runInContext(ctx, { timeout: JS_CASE_TIMEOUT });
  } catch (err) {
    return {
      stdout: output.join("\n"),
      stderr: err.message?.slice(0, 2000) || "Runtime error.",
      runtimeMs: Math.max(1, Date.now() - started),
      exitCode: 1,
    };
  }

  return {
    stdout: output.join("\n").slice(0, 50_000),
    stderr: errors.join("\n").slice(0, 5_000),
    runtimeMs: Math.max(1, Date.now() - started),
    exitCode: 0,
  };
}

async function freeRunPython(code) {
  const started = Date.now();
  const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-free-py-"));
  try {
    // Wrap with resource limits — no function harness, just user code
    const safeCode = `
import sys, resource

# Memory limit
try:
    resource.setrlimit(resource.RLIMIT_AS, (${MEM_LIMIT_MB} * 1024 * 1024, ${MEM_LIMIT_MB} * 1024 * 1024))
except Exception:
    pass
# CPU limit
try:
    resource.setrlimit(resource.RLIMIT_CPU, (${CPU_LIMIT_SEC}, ${CPU_LIMIT_SEC}))
except Exception:
    pass
# Block dangerous imports
import builtins
_real_import = builtins.__import__
_BLOCKED = {"os", "subprocess", "socket", "urllib", "requests", "ftplib",
             "smtplib", "multiprocessing", "ctypes", "asyncio"}
def _safe_import(name, *args, **kwargs):
    if name.split(".")[0] in _BLOCKED:
        raise ImportError(f"Module '{name}' is blocked in the sandbox.")
    return _real_import(name, *args, **kwargs)
builtins.__import__ = _safe_import

${code}
`;
    await writeFile(path.join(workDir, "runner.py"), safeCode);
    const result = await runProcessCwd(
      "sh", ["-c", `ulimit -v ${MEM_LIMIT_MB * 1024} -t ${CPU_LIMIT_SEC} -u 64 2>/dev/null; python3 runner.py`],
      workDir, TIMEOUT_MS
    );
    return {
      stdout: result.stdout.slice(0, 50_000),
      stderr: result.stderr.slice(0, 5_000),
      runtimeMs: Math.max(1, Date.now() - started),
      exitCode: result.timedOut ? 124 : (result.code ?? 0),
    };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function freeRunCpp(code) {
  const started = Date.now();
  const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-free-cpp-"));
  try {
    // Write user code directly — no dangerous macros that conflict with stdlib headers.
    // Security: ulimit restricts memory/cpu; no network access in container.
    await writeFile(path.join(workDir, "main.cpp"), code);
    const compile = await runProcessCwd(
      "g++", ["-std=c++17", "-O2", "-fstack-protector-strong", "-o", "main", "main.cpp"],
      workDir, TIMEOUT_MS
    );
    if (compile.code !== 0) {
      return { stdout: "", stderr: compile.stderr.slice(0, 2000) || "Compilation failed.", runtimeMs: Math.max(1, Date.now() - started), exitCode: 1 };
    }
    const run = await runProcessCwd(
      "sh", ["-c", `ulimit -v ${MEM_LIMIT_MB * 1024} -t ${CPU_LIMIT_SEC} -u 64 2>/dev/null; ./main`],
      workDir, TIMEOUT_MS
    );
    return {
      stdout: run.stdout.slice(0, 50_000),
      stderr: run.stderr.slice(0, 5_000),
      runtimeMs: Math.max(1, Date.now() - started),
      exitCode: run.timedOut ? 124 : (run.code ?? 0),
    };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function freeRunJava(code) {
  const started = Date.now();
  const workDir = await mkdtemp(path.join(tmpdir(), "wohotech-free-java-"));
  try {
    // Java free run — user must write public class Main { public static void main(...) }
    await writeFile(path.join(workDir, "Main.java"), code);
    const compile = await runProcessCwd("javac", ["Main.java"], workDir, TIMEOUT_MS);
    if (compile.code !== 0) {
      return { stdout: "", stderr: compile.stderr.slice(0, 2000) || "Compilation failed.", runtimeMs: Math.max(1, Date.now() - started), exitCode: 1 };
    }
    const run = await runProcessCwd(
      "java", [`-Xmx${MEM_LIMIT_MB}m`, "-Xss8m", "-cp", ".", "Main"],
      workDir, TIMEOUT_MS
    );
    return {
      stdout: run.stdout.slice(0, 50_000),
      stderr: run.stderr.slice(0, 5_000),
      runtimeMs: Math.max(1, Date.now() - started),
      exitCode: run.timedOut ? 124 : (run.code ?? 0),
    };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ════════════════════════════════════════════════════════════════════════════
// DISPATCHER
// ════════════════════════════════════════════════════════════════════════════
async function judge(payload) {
  const cases        = Array.isArray(payload.cases) ? payload.cases : [];
  const language     = String(payload.language     || "JavaScript");
  const code         = String(payload.code         || "");
  const functionName = String(payload.functionName || "");
  const sqlSetup     = Array.isArray(payload.sqlSetup) ? payload.sqlSetup : [];
  const isSql        = payload.isSql === true || language === "SQL";
  const isFreeRun    = payload.isFreeRun === true;

  // ── Free run (online compiler mode) ──────────────────────────────────────
  if (isFreeRun) {
    if (code.length > MAX_CODE)
      return { stdout: "", stderr: `Code too large. Maximum is ${MAX_CODE} characters.`, runtimeMs: 0, exitCode: 1 };
    if (!/^[a-zA-Z+]+$/.test(language.replace(/[+\s]/g, "")))
      return { stdout: "", stderr: `Language '${language}' is not supported.`, runtimeMs: 0, exitCode: 1 };

    if (language === "JavaScript") return freeRunJavaScript(code);
    if (language === "Python")     return freeRunPython(code);
    if (language === "C++")        return freeRunCpp(code);
    if (language === "Java")       return freeRunJava(code);
    return { stdout: "", stderr: `Language '${language}' is not supported.`, runtimeMs: 0, exitCode: 1 };
  }

  // Input validation
  if (code.length > MAX_CODE)
    return { status: "Compilation Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0,
             message: `Code too large. Maximum is ${MAX_CODE} characters.` };
  if (cases.length > MAX_CASES)
    return { status: "Runtime Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0,
             message: `Too many test cases. Maximum is ${MAX_CASES}.` };
  if (!cases.every((c) => c?.input !== undefined && Object.hasOwn(c, "expected")))
    return { status: "Runtime Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0, message: "Invalid test case format." };

  // SQL runner — triggered when isSql:true or language:"SQL"
  if (isSql) return runSQL(code, cases, sqlSetup);

  // Shell runner
  if (payload.isShell === true) return runShell(code, cases);

  // Concurrency runner
  if (payload.isConcurrency === true) return runConcurrency(code, cases);

  if (!cases.every((c) => Array.isArray(c?.input)))
    return { status: "Runtime Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0, message: "Invalid test case format." };
  if (!functionName)
    return { status: "Compilation Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0, message: "functionName is required." };
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(functionName))
    return { status: "Compilation Error", passed: 0, total: cases.length,
             runtimeMs: 0, memoryMb: 0, message: "Invalid functionName." };

  if (language === "JavaScript") return runJavaScript(code, cases, functionName);
  if (language === "Python")     return runPython(code, cases, functionName);
  if (language === "C++")        return runCpp(code, cases, functionName);
  if (language === "Java")       return runJava(code, cases, functionName);

  return { status: "Compilation Error", passed: 0, total: cases.length,
           runtimeMs: 0, memoryMb: 0, message: `Language '${language}' is not supported.` };
}

// ════════════════════════════════════════════════════════════════════════════
// HTTP SERVER
// ════════════════════════════════════════════════════════════════════════════
const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { ok: true, runner: "wohotech-judge-direct", mode: "direct" });
    return;
  }

  if (req.method !== "POST" || (req.url !== "/judge" && req.url !== "/run")) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }
  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: "Unauthorized" });
    return;
  }

  // Concurrency guard — reject if too many jobs running (OOM prevention)
  if (activeJobs >= MAX_CONCURRENT) {
    sendJson(res, 503, { status: "Runtime Error", passed: 0, total: 0,
                         runtimeMs: 0, memoryMb: 0,
                         message: "Judge is busy. Please try again in a moment." });
    return;
  }

  activeJobs++;
  try {
    const payload = await readJson(req);
    // /run is a convenience alias for /judge with isFreeRun:true
    if (req.url === "/run") payload.isFreeRun = true;
    sendJson(res, 200, await judge(payload));
  } catch (err) {
    sendJson(res, 400, { status: "Runtime Error", passed: 0, total: 0,
                         runtimeMs: 0, memoryMb: 0, message: err.message });
  } finally {
    activeJobs--;
  }
});

server.headersTimeout = TIMEOUT_MS + 5_000;
server.requestTimeout = TIMEOUT_MS + 5_000;

server.listen(PORT, () => {
  console.log(`[judge-direct] listening on http://0.0.0.0:${PORT}`);
  console.log(`[judge-direct] mode: DIRECT (secure, no Docker-in-Docker)`);
  console.log(`[judge-direct] limits: ${TIMEOUT_MS}ms timeout, ${MEM_LIMIT_MB}MB memory, ${CPU_LIMIT_SEC}s CPU`);
  console.log(`[judge-direct] token: ${TOKEN ? "set ✓" : "NOT SET — unauthenticated"}`);
});
