"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CodeEditor } from "@/components/problems/code-editor";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Moon,
  Play,
  Sun,
  Terminal,
  Trash2,
} from "lucide-react";

type Language =
  | "JavaScript"
  | "TypeScript"
  | "Python"
  | "C++"
  | "C"
  | "Java"
  | "Go"
  | "Rust"
  | "Kotlin"
  | "Ruby"
  | "PHP"
  | "C#"
  | "SQL"
  | "Bash";

type ThemeMode = "dark" | "light";
type RunResult = { stdout: string; stderr: string; runtimeMs: number; exitCode: number } | null;

const LANGUAGES: readonly Language[] = [
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
] as const;

const STARTER: Record<Language, string> = {
  JavaScript: `// Woho Code Editor - JavaScript
// Press Ctrl+Enter to run

console.log("Hello, World!");

const nums = [1, 2, 3, 4, 5];
const sum = nums.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
`,
  TypeScript: `// Woho Code Editor - TypeScript
// Press Ctrl+Enter to run

const greeting: string = "Hello, World!";
console.log(greeting);

interface User { name: string; age: number; }
const user: User = { name: "Woho", age: 25 };
console.log(\`\${user.name} is \${user.age} years old\`);
`,
  Python: `# Woho Code Editor - Python
# Press Ctrl+Enter to run

print("Hello, World!")

nums = [1, 2, 3, 4, 5]
print("Sum:", sum(nums))
`,
  "C++": `// Woho Code Editor - C++
// Press Ctrl+Enter to run
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
  C: `// Woho Code Editor - C
// Press Ctrl+Enter to run
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    int nums[] = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int i = 0; i < 5; i++) sum += nums[i];
    printf("Sum: %d\\n", sum);
    return 0;
}
`,
  Java: `// Woho Code Editor - Java
// Your class must be named Main
// Press Ctrl+Enter to run

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,
  Go: `// Woho Code Editor - Go
// Press Ctrl+Enter to run
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    nums := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, n := range nums { sum += n }
    fmt.Println("Sum:", sum)
}
`,
  Rust: `// Woho Code Editor - Rust
// Press Ctrl+Enter to run
fn main() {
    println!("Hello, World!");
    let nums = vec![1, 2, 3, 4, 5];
    let sum: i32 = nums.iter().sum();
    println!("Sum: {}", sum);
}
`,
  Kotlin: `// Woho Code Editor - Kotlin
// Press Ctrl+Enter to run
fun main() {
    println("Hello, World!")
    val nums = listOf(1, 2, 3, 4, 5)
    println("Sum: \${nums.sum()}")
}
`,
  Ruby: `# Woho Code Editor - Ruby
# Press Ctrl+Enter to run
puts "Hello, World!"
nums = [1, 2, 3, 4, 5]
puts "Sum: #{nums.sum}"
`,
  PHP: `<?php
// Woho Code Editor - PHP
// Press Ctrl+Enter to run
echo "Hello, World!\\n";
$nums = [1, 2, 3, 4, 5];
echo "Sum: " . array_sum($nums) . "\\n";
`,
  "C#": `// Woho Code Editor - C#
// Press Ctrl+Enter to run
using System;
using System.Linq;

class Program {
    static void Main(string[] args) {
        Console.WriteLine("Hello, World!");
        int[] nums = {1, 2, 3, 4, 5};
        Console.WriteLine("Sum: " + nums.Sum());
    }
}
`,
  SQL: `-- Woho Code Editor - SQL
-- Press Ctrl+Enter to run

SELECT 'Hello, World!' AS greeting;

CREATE TABLE example (id INTEGER PRIMARY KEY, name TEXT, score REAL);

INSERT INTO example (id, name, score) VALUES
    (1, 'Alice', 95.5),
    (2, 'Bob', 87.3),
    (3, 'Charlie', 92.1);

SELECT name, score FROM example ORDER BY score DESC;
`,
  Bash: `#!/bin/bash
# Woho Code Editor - Bash
# Press Ctrl+Enter to run

echo "Hello, World!"

nums=(1 2 3 4 5)
sum=0
for n in "\${nums[@]}"; do
    sum=$((sum + n))
done
echo "Sum: $sum"
`,
};

const STORAGE_KEY_THEME = "wohotech-code-editor-theme";
const STORAGE_KEY_LANG = "wohotech-code-editor-language";
const STORAGE_PREFIX = "wohotech-code-editor-code:";

export default function WohoCodeEditorPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [language, setLanguage] = useState<Language>("JavaScript");
  const [code, setCode] = useState(STARTER.JavaScript);
  const [savedAt, setSavedAt] = useState("Starter code");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RunResult>(null);
  const [warming, setWarming] = useState(false);
  const runCodeRef = useRef<() => void>(() => {});

  const isDark = theme === "dark";

  // Fire warmup on page load and on every language change to a compiled language
  useEffect(() => {
    const COMPILED = new Set(["Java", "C++", "C", "Python", "Go", "Rust", "Kotlin", "Ruby", "PHP", "C#", "Bash", "TypeScript"]);
    if (!COMPILED.has(language)) return;
    setWarming(true);
    const controller = new AbortController();
    fetch("/api/problems/judge/warmup", { method: "POST", signal: controller.signal })
      .catch(() => {})
      .finally(() => setWarming(false));
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);

    const storedLanguage = localStorage.getItem(STORAGE_KEY_LANG) as Language | null;
    if (storedLanguage && (LANGUAGES as readonly string[]).includes(storedLanguage)) {
      setLanguage(storedLanguage);
      const savedCode = localStorage.getItem(STORAGE_PREFIX + storedLanguage);
      setCode(savedCode ?? STARTER[storedLanguage]);
      setSavedAt(savedCode ? "Saved" : "Starter code");
    }
  }, []);

  useEffect(() => {
    if (!mounted || !code.trim()) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_PREFIX + language, code);
      setSavedAt(`Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [code, language, mounted]);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
  };

  const changeLanguage = (nextLanguage: string) => {
    const lang = nextLanguage as Language;
    setLanguage(lang);
    const savedCode = localStorage.getItem(STORAGE_PREFIX + lang);
    setCode(savedCode ?? STARTER[lang]);
    setSavedAt(savedCode ? "Saved" : "Starter code");
    setResult(null);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  };

  const runCode = async () => {
    if (isRunning || !code.trim()) return;
    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const data = await response.json();
      setResult({
        stdout: String(data.stdout ?? ""),
        stderr: String(data.stderr ?? ""),
        runtimeMs: Number(data.runtimeMs ?? 0),
        exitCode: Number(data.exitCode ?? 0),
      });
    } catch (error) {
      setResult({
        stdout: "",
        stderr: error instanceof Error ? error.message : "Network error.",
        runtimeMs: 0,
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  runCodeRef.current = runCode;

  const c = isDark ? {
    root: "bg-[#0b1220] text-slate-100",
    header: "bg-[#111827]/95 border-[#1e293b]",
    main: "bg-[#0d1424]",
    panel: "bg-[#111827] border-[#243045]",
    outputHdr: "bg-[#111827] border-[#243045]",
    outputBody: "bg-[#020617]",
    outputTxt: "text-emerald-300",
    outputErr: "text-rose-300",
    statusBar: "bg-[#0f172a] border-[#243045] text-slate-500",
    muted: "text-slate-400",
    toolbarTxt: "text-slate-100",
    icon: "text-slate-400 hover:text-slate-100 hover:bg-slate-800",
    badge: "bg-orange-500/10 text-orange-300 border border-orange-500/20",
  } : {
    root: "bg-[#f8fafc] text-gray-900",
    header: "bg-white border-gray-200",
    main: "bg-[#edf2f7]",
    panel: "bg-white border-gray-200",
    outputHdr: "bg-white border-gray-200",
    outputBody: "bg-[#020617]",
    outputTxt: "text-emerald-300",
    outputErr: "text-rose-300",
    statusBar: "bg-white border-gray-200 text-gray-400",
    muted: "text-gray-500",
    toolbarTxt: "text-gray-900",
    icon: "text-gray-400 hover:text-gray-900 hover:bg-gray-100",
    badge: "bg-orange-50 text-orange-600 border border-orange-200",
  };

  if (!mounted) {
    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center ${isDark ? "bg-[#0b1220]" : "bg-[#f8fafc]"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-700 border-t-sky-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] flex h-dvh w-screen flex-col overflow-hidden transition-colors duration-200 ${c.root}`}>
      <header className={`flex h-14 shrink-0 items-center justify-between border-b px-4 ${c.header}`}>
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-gray-400 hover:bg-gray-100"}`}
            aria-label="Home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 shadow-sm">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <span className={`truncate text-lg font-bold ${c.toolbarTxt}`}>Woho Code Editor</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={isRunning || !code.trim()}
            onClick={runCode}
            title="Run code"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Play className="h-4 w-4 fill-white" />
            )}
            <span className="hidden sm:inline">{isRunning ? "Running..." : "Run Code"}</span>
            <span className="sm:hidden">Run</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Light mode" : "Dark mode"}
            className={`grid h-10 w-10 place-items-center rounded-lg border transition ${isDark ? "border-[#1e293b] text-amber-400 hover:bg-slate-800" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className={`grid min-h-0 flex-1 gap-3 p-3 lg:h-full lg:overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.55fr)] ${c.main}`}>

        {/* Editor panel */}
        <section className={`flex min-h-[56vh] flex-col overflow-hidden rounded-lg border shadow-sm lg:h-full lg:min-h-0 ${c.panel}`}>
          <CodeEditor
            value={code}
            language={language}
            languages={LANGUAGES}
            savedAt={savedAt}
            disabled={isRunning}
            theme={isDark ? "dark" : "light"}
            showRunButton={false}
            onChange={setCode}
            onLanguageChange={changeLanguage}
            onRun={runCode}
            onSave={() => {
              localStorage.setItem(STORAGE_PREFIX + language, code);
              setSavedAt(`Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
            }}
            onReset={() => {
              setCode(STARTER[language]);
              localStorage.setItem(STORAGE_PREFIX + language, STARTER[language]);
              setSavedAt("Reset");
              setResult(null);
            }}
          />
        </section>

        {/* Output panel */}
        <section className={`flex min-h-[40vh] flex-col overflow-hidden rounded-lg border shadow-sm lg:h-full lg:min-h-0 ${c.panel}`}>
          <div className={`flex h-12 shrink-0 items-center justify-between border-b px-4 ${c.outputHdr}`}>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span className={`text-sm font-bold ${c.toolbarTxt}`}>Output</span>
              {result && !isRunning && (
                <span className={`flex items-center gap-1 text-xs ${c.muted}`}>
                  <Clock className="h-3 w-3" />
                  {result.runtimeMs} ms
                </span>
              )}
              {isRunning && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-500">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                  </span>
                  Running...
                </span>
              )}
              {!isRunning && warming && (
                <span className="flex items-center gap-1.5 text-xs text-amber-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                  </span>
                  Warming up...
                </span>
              )}
            </div>

            {result && !isRunning && (
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  result.exitCode === 0
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
                    : "border-rose-500/25 bg-rose-500/10 text-rose-500"
                }`}>
                  {result.exitCode === 0 ? "Exit 0" : `Exit ${result.exitCode}`}
                </span>
                <button
                  type="button"
                  title="Clear output"
                  onClick={() => setResult(null)}
                  className={`grid h-8 w-8 place-items-center rounded-md transition ${c.icon}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className={`min-h-0 flex-1 overflow-auto p-4 font-mono text-sm ${c.outputBody}`}>
            {isRunning ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500" />
                <p className="text-xs font-medium text-slate-400">Running your code...</p>
                {["Java","C++","C","Python","Go","Rust","Kotlin","Ruby","PHP","C#","TypeScript","Bash"].includes(language) && (
                  <p className="text-[11px] text-slate-500">First run may take 30–60 s (server warming up)</p>
                )}
              </div>
            ) : result ? (
              <div className="space-y-4">
                {result.stdout && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase text-slate-500">stdout</p>
                    <pre className={`whitespace-pre-wrap break-words leading-6 ${c.outputTxt}`}>{result.stdout}</pre>
                  </div>
                )}
                {result.stderr && (
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500">
                      <AlertCircle className="h-3 w-3 text-rose-400" />
                      stderr
                    </div>
                    <pre className={`whitespace-pre-wrap break-words leading-6 ${c.outputErr}`}>{result.stderr}</pre>
                  </div>
                )}
                {!result.stdout && !result.stderr && (
                  <p className="text-xs text-slate-400">Program exited with code {result.exitCode}. No output produced.</p>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900/80 p-8">
                  <Terminal className="mx-auto mb-4 h-10 w-10 text-slate-500" />
                  <p className="text-sm font-bold text-slate-300">Output will appear here</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Press <kbd className="rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[10px] text-slate-300">Ctrl+Enter</kbd> or click <span className="font-semibold text-emerald-400">Run</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={`shrink-0 border-t px-4 py-2 text-xs ${c.statusBar}`}>
            {language === "Java" && <>Java: your class must be named <code className="font-mono font-bold">Main</code>.</>}
            {language === "C++" && <>C++: use <code className="font-mono">cout</code> for output.</>}
            {language === "C" && <>C: use <code className="font-mono">printf()</code> for output.</>}
            {language === "Python" && <>Python: use <code className="font-mono">print()</code> for output.</>}
            {language === "JavaScript" && <>JavaScript: use <code className="font-mono">console.log()</code> for output.</>}
            {language === "TypeScript" && <>TypeScript: use <code className="font-mono">console.log()</code> for output.</>}
            {language === "Go" && <>Go: use <code className="font-mono">fmt.Println()</code> for output.</>}
            {language === "Rust" && <>Rust: use <code className="font-mono">println!()</code> for output.</>}
            {language === "Kotlin" && <>Kotlin: use <code className="font-mono">println()</code> for output.</>}
            {language === "Ruby" && <>Ruby: use <code className="font-mono">puts</code> for output.</>}
            {language === "PHP" && <>PHP: use <code className="font-mono">echo</code> for output.</>}
            {language === "C#" && <>C#: use <code className="font-mono">Console.WriteLine()</code> for output.</>}
            {language === "SQL" && <>SQL: only SELECT queries are allowed for safety.</>}
            {language === "Bash" && <>Bash: use <code className="font-mono">echo</code> for output.</>}
          </div>
        </section>
      </main>
    </div>
  );
}
