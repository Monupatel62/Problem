"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  AlertCircle, ArrowLeft, Check, ChevronDown, Clock,
  Code2, Copy, Expand, FileCode, Keyboard, Loader2,
  Moon, Play, Plus, RefreshCw, Settings, Share2,
  Shrink, Square, Sun, Terminal, Trash2, Type, X,
} from "lucide-react";

// Monaco lazy load — avoids bundling 2MB editor into initial JS chunk
const CodeEditor = dynamic(
  () => import("@/components/problems/code-editor").then((m) => ({ default: m.CodeEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#0d1117]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-[#58a6ff]" />
      </div>
    ),
  }
);

/* ─────────────────────── types ── */
type Language = "JavaScript" | "TypeScript" | "Python" | "C++" | "C" | "Java" | "Go" | "Rust" | "Kotlin" | "Ruby" | "PHP" | "C#" | "SQL" | "Bash";
type ThemeMode = "dark" | "light";
type LayoutMode = "side" | "top";
type OutputTab = "output" | "stdin";
type RunResult = { stdout: string; stderr: string; runtimeMs: number; memoryKb?: number; exitCode: number } | null;

/* ─────────────────────── constants ── */
const LANGUAGES: readonly Language[] = [
  "JavaScript","TypeScript","Python","C++","C","Java","Go","Rust","Kotlin","Ruby","PHP","C#","SQL","Bash",
] as const;

const LANG_ICON: Record<Language, string> = {
  JavaScript:"🟨", TypeScript:"🔷", Python:"🐍", "C++":"⚙️", C:"🔩",
  Java:"☕", Go:"🐹", Rust:"🦀", Kotlin:"🎯", Ruby:"💎",
  PHP:"🐘", "C#":"🔵", SQL:"🗄️", Bash:"🖥️",
};

const STARTER: Record<Language, string> = {
  JavaScript:`// WohoCode — JavaScript\nconsole.log("Hello, World!");\nconst nums = [1,2,3,4,5];\nconsole.log("Sum:", nums.reduce((a,b)=>a+b,0));\n`,
  TypeScript:`// WohoCode — TypeScript\nconst msg: string = "Hello, World!";\nconsole.log(msg);\ninterface User { name: string; age: number; }\nconst u: User = { name: "Woho", age: 25 };\nconsole.log(\`\${u.name} is \${u.age}\`);\n`,
  Python:`# WohoCode — Python\nprint("Hello, World!")\nnums = [1,2,3,4,5]\nprint("Sum:", sum(nums))\n# Read input: s = input()\n`,
  "C++":"// WohoCode — C++\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    cout << \"Hello, World!\" << endl;\n    // Read input: int n; cin >> n;\n    return 0;\n}\n",
  C:"// WohoCode — C\n#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}\n",
  Java:"// WohoCode — Java (class must be named Main)\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n        // Read input: Scanner sc = new Scanner(System.in);\n    }\n}\n",
  Go:"// WohoCode — Go\npackage main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}\n",
  Rust:"// WohoCode — Rust\nfn main() {\n    println!(\"Hello, World!\");\n}\n",
  Kotlin:"// WohoCode — Kotlin\nfun main() {\n    println(\"Hello, World!\")\n}\n",
  Ruby:"# WohoCode — Ruby\nputs \"Hello, World!\"\nnums = [1,2,3,4,5]\nputs \"Sum: #{nums.sum}\"\n",
  PHP:"<?php\n// WohoCode — PHP\necho \"Hello, World!\\n\";\n",
  "C#":"// WohoCode — C#\nusing System;\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello, World!\");\n    }\n}\n",
  SQL:"-- WohoCode — SQL\nSELECT 'Hello, World!' AS greeting;\n",
  Bash:"#!/bin/bash\n# WohoCode — Bash\necho \"Hello, World!\"\n",
};

const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20];
const STORAGE = {
  theme: "wc-theme", lang: "wc-lang", layout: "wc-layout", fontSize: "wc-fontsize",
  codePrefix: "wc-code:", stdinPrefix: "wc-stdin:",
};

/* ─────────────────────── helpers ── */
function fmtTime(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms/1000).toFixed(2)}s`;
}
function fmtMem(kb?: number) {
  if (!kb) return "";
  if (kb < 1024) return `${kb}KB`;
  return `${(kb/1024).toFixed(1)}MB`;
}

/* ═══════════════════════════════════ PAGE ══ */
export default function WohoCodeEditorPage() {
  const [mounted, setMounted]     = useState(false);
  const [theme, setTheme]         = useState<ThemeMode>("dark");
  const [language, setLanguage]   = useState<Language>("JavaScript");
  const [code, setCode]           = useState(STARTER.JavaScript);
  const [stdin, setStdin]         = useState("");
  const [fontSize, setFontSize]   = useState(14);
  const [layout, setLayout]       = useState<LayoutMode>("side");
  const [activeTab, setActiveTab] = useState<OutputTab>("output");
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl]   = useState("");
  const [copied, setCopied]       = useState(false);
  const [copiedOut, setCopiedOut] = useState(false);
  const [savedAt, setSavedAt]     = useState("Starter code");
  const [isRunning, setIsRunning] = useState(false);
  const [warming, setWarming]     = useState(false);
  const [result, setResult]       = useState<RunResult>(null);
  const isDark = theme === "dark";

  /* ── init ── */
  useEffect(() => {
    setMounted(true);
    const t = localStorage.getItem(STORAGE.theme);
    if (t === "light" || t === "dark") setTheme(t);
    const fs = Number(localStorage.getItem(STORAGE.fontSize));
    if (fs && FONT_SIZES.includes(fs)) setFontSize(fs);
    const ly = localStorage.getItem(STORAGE.layout);
    if (ly === "side" || ly === "top") setLayout(ly);
    const lang = localStorage.getItem(STORAGE.lang) as Language | null;
    const activeLang = (lang && (LANGUAGES as readonly string[]).includes(lang)) ? lang : "JavaScript";
    setLanguage(activeLang);
    const saved = localStorage.getItem(STORAGE.codePrefix + activeLang);
    setCode(saved ?? STARTER[activeLang]);
    setSavedAt(saved ? "Saved" : "Starter code");
    const savedStdin = localStorage.getItem(STORAGE.stdinPrefix + activeLang);
    if (savedStdin) setStdin(savedStdin);

    // Check URL for shared code
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get("c");
    const sharedLang = params.get("l") as Language | null;
    if (sharedCode) {
      try {
        const decoded = atob(sharedCode);
        if (sharedLang && (LANGUAGES as readonly string[]).includes(sharedLang)) {
          setLanguage(sharedLang);
        }
        setCode(decoded);
        setSavedAt("Shared code");
      } catch {}
    }
  }, []);

  /* ── autosave ── */
  useEffect(() => {
    if (!mounted || !code.trim()) return;
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE.codePrefix + language, code);
      setSavedAt(`Saved ${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`);
    }, 800);
    return () => clearTimeout(t);
  }, [code, language, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE.stdinPrefix + language, stdin);
  }, [stdin, language, mounted]);

  /* ── warmup ── */
  useEffect(() => {
    const compiled = new Set(["Java","C++","C","Python","Go","Rust","Kotlin","Ruby","PHP","C#","Bash","TypeScript"]);
    if (!compiled.has(language)) return;
    setWarming(true);
    const ctrl = new AbortController();
    fetch("/api/problems/judge/warmup", { method:"POST", signal:ctrl.signal })
      .catch(()=>{}).finally(()=>setWarming(false));
    return () => ctrl.abort();
  }, [language]);

  /* ── actions ── */
  const toggleTheme = () => {
    const n = isDark ? "light" : "dark";
    setTheme(n); localStorage.setItem(STORAGE.theme, n);
  };

  const changeLanguage = (lang: string) => {
    const l = lang as Language;
    setLanguage(l); localStorage.setItem(STORAGE.lang, l);
    const saved = localStorage.getItem(STORAGE.codePrefix + l);
    setCode(saved ?? STARTER[l]);
    setSavedAt(saved ? "Saved" : "Starter code");
    setResult(null);
    const savedStdin = localStorage.getItem(STORAGE.stdinPrefix + l);
    setStdin(savedStdin ?? "");
  };

  const runCode = useCallback(async () => {
    if (isRunning || !code.trim()) return;
    setIsRunning(true); setResult(null); setActiveTab("output");
    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin }),
      });
      const d = await res.json();
      setResult({
        stdout: String(d.stdout ?? ""),
        stderr: String(d.stderr ?? ""),
        runtimeMs: Number(d.runtimeMs ?? 0),
        memoryKb: d.memoryKb ? Number(d.memoryKb) : undefined,
        exitCode: Number(d.exitCode ?? 0),
      });
    } catch(e) {
      setResult({ stdout:"", stderr:e instanceof Error ? e.message : "Network error", runtimeMs:0, exitCode:1 });
    } finally { setIsRunning(false); }
  }, [code, isRunning, language, stdin]);

  const resetCode = () => {
    setCode(STARTER[language]);
    localStorage.setItem(STORAGE.codePrefix + language, STARTER[language]);
    setSavedAt("Reset"); setResult(null);
  };

  const shareCode = () => {
    const encoded = btoa(code);
    const url = `${window.location.origin}/code?l=${language}&c=${encoded}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); setTimeout(()=>setCopied(false), 2000);
    });
    setShowShare(true);
  };

  const copyOutput = () => {
    const text = result ? (result.stdout + (result.stderr ? "\n\nSTDERR:\n" + result.stderr : "")) : "";
    navigator.clipboard.writeText(text).then(() => {
      setCopiedOut(true); setTimeout(()=>setCopiedOut(false), 2000);
    });
  };

  /* ── theme colors ── */
  const c = isDark ? {
    bg:"bg-[#0d1117]", header:"bg-[#161b22] border-[#30363d]",
    panel:"bg-[#161b22] border-[#30363d]", body:"bg-[#0d1117]",
    outBody:"bg-[#010409]", txt:"text-[#e6edf3]", muted:"text-[#8b949e]",
    icon:"text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]",
    tab:"bg-[#21262d] text-[#e6edf3]", tabInactive:"text-[#8b949e] hover:text-[#e6edf3]",
    input:"bg-[#0d1117] border-[#30363d] text-[#e6edf3] placeholder-[#6e7681]",
    kbd:"bg-[#21262d] border-[#30363d] text-[#8b949e]",
    select:"bg-[#21262d] border-[#30363d] text-[#e6edf3]",
    settingsBg:"bg-[#161b22] border-[#30363d]",
  } : {
    bg:"bg-[#f6f8fa]", header:"bg-white border-[#d0d7de]",
    panel:"bg-white border-[#d0d7de]", body:"bg-[#f6f8fa]",
    outBody:"bg-[#24292f]", txt:"text-[#24292f]", muted:"text-[#57606a]",
    icon:"text-[#57606a] hover:text-[#24292f] hover:bg-[#f6f8fa]",
    tab:"bg-[#f6f8fa] text-[#24292f]", tabInactive:"text-[#57606a] hover:text-[#24292f]",
    input:"bg-white border-[#d0d7de] text-[#24292f] placeholder-[#8c959f]",
    kbd:"bg-[#f6f8fa] border-[#d0d7de] text-[#57606a]",
    select:"bg-white border-[#d0d7de] text-[#24292f]",
    settingsBg:"bg-white border-[#d0d7de]",
  };

  if (!mounted) return (
    <div className={`fixed inset-0 flex items-center justify-center ${isDark?"bg-[#0d1117]":"bg-[#f6f8fa]"}`}>
      <Loader2 className="h-7 w-7 animate-spin text-[#58a6ff]" />
    </div>
  );

  const isCompiledLang = ["Java","C++","C","Python","Go","Rust","Kotlin","Ruby","PHP","C#","TypeScript","Bash"].includes(language);
  const gridClass = layout === "side"
    ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]"
    : "grid-rows-[1fr_1fr] grid-cols-1";

  return (
    <div className={`fixed inset-0 flex h-dvh w-screen flex-col overflow-hidden ${c.bg} ${c.txt}`}>

      {/* ═════════════════ HEADER ══ */}
      <header className={`flex h-12 shrink-0 items-center gap-2 border-b px-3 ${c.header}`}>

        {/* Left */}
        <Link href="/problems" className={`grid h-8 w-8 shrink-0 place-items-center rounded-md transition ${c.icon}`} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#58a6ff]/20">
            <Code2 className="h-4 w-4 text-[#58a6ff]" />
          </div>
          <span className="hidden text-sm font-bold sm:block">WohoCode</span>
        </div>

        {/* Language selector */}
        <div className="relative ml-2">
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className={`h-8 appearance-none rounded-md border pl-7 pr-6 text-xs font-semibold outline-none transition cursor-pointer ${c.select}`}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{LANG_ICON[l]} {l}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs">{LANG_ICON[language]}</span>
          <ChevronDown className={`pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 ${c.muted}`} />
        </div>

        {/* Status */}
        <div className={`hidden items-center gap-1.5 text-xs sm:flex ${c.muted}`}>
          {warming && !isRunning && (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-400" />
              Warming up
            </span>
          )}
          {!warming && <span>{savedAt}</span>}
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1 shrink-0">

          {/* Font size */}
          <div className="hidden items-center gap-1 sm:flex">
            <button onClick={() => { const i=FONT_SIZES.indexOf(fontSize); if(i>0){const n=FONT_SIZES[i-1];setFontSize(n);localStorage.setItem(STORAGE.fontSize,String(n));} }}
              className={`grid h-7 w-7 place-items-center rounded-md text-xs transition ${c.icon}`} title="Decrease font size">A-</button>
            <span className={`text-xs tabular-nums ${c.muted}`}>{fontSize}</span>
            <button onClick={() => { const i=FONT_SIZES.indexOf(fontSize); if(i<FONT_SIZES.length-1){const n=FONT_SIZES[i+1];setFontSize(n);localStorage.setItem(STORAGE.fontSize,String(n));} }}
              className={`grid h-7 w-7 place-items-center rounded-md text-base transition ${c.icon}`} title="Increase font size">A+</button>
          </div>

          {/* Layout toggle */}
          <button onClick={() => { const n=layout==="side"?"top":"side"; setLayout(n); localStorage.setItem(STORAGE.layout,n); }}
            title={layout==="side"?"Switch to top layout":"Switch to side layout"}
            className={`hidden h-7 w-7 place-items-center rounded-md transition sm:grid ${c.icon}`}>
            {layout==="side" ? <Expand className="h-3.5 w-3.5" /> : <Shrink className="h-3.5 w-3.5" />}
          </button>

          {/* Share */}
          <button onClick={shareCode}
            className={`grid h-7 w-7 place-items-center rounded-md transition ${c.icon}`} title="Share code">
            <Share2 className="h-3.5 w-3.5" />
          </button>

          {/* Reset */}
          <button onClick={resetCode}
            className={`grid h-7 w-7 place-items-center rounded-md transition ${c.icon}`} title="Reset to starter code">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Theme */}
          <button onClick={toggleTheme}
            className={`grid h-7 w-7 place-items-center rounded-md transition ${c.icon}`}
            title={isDark?"Light mode":"Dark mode"}>
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Keyboard shortcuts button */}
          <button onClick={() => setShowSettings(v=>!v)}
            className={`grid h-7 w-7 place-items-center rounded-md transition ${c.icon}`} title="Keyboard shortcuts">
            <Keyboard className="h-3.5 w-3.5" />
          </button>

          {/* RUN */}
          <button
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            className="ml-1 flex h-8 items-center gap-1.5 rounded-md bg-[#238636] px-3 text-sm font-semibold text-white transition hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span className="hidden sm:inline">Running…</span></>
              : <><Play className="h-3.5 w-3.5 fill-white" /><span className="hidden sm:inline">Run</span><span className="sm:hidden text-xs ml-0.5">▶</span></>
            }
          </button>
        </div>
      </header>

      {/* ═════════════════ MAIN GRID ══ */}
      <div className={`grid min-h-0 flex-1 gap-2 p-2 overflow-hidden ${gridClass}`}>

        {/* ── EDITOR PANEL ── */}
        <div className={`flex min-h-0 flex-col overflow-hidden rounded-lg border ${c.panel}`}>
          <CodeEditor
            value={code}
            language={language}
            languages={LANGUAGES}
            savedAt={savedAt}
            disabled={isRunning}
            theme={isDark?"dark":"light"}
            showRunButton={false}
            onChange={setCode}
            onLanguageChange={changeLanguage}
            onRun={runCode}
            onSave={() => {
              localStorage.setItem(STORAGE.codePrefix+language, code);
              setSavedAt(`Saved ${new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`);
            }}
            onReset={resetCode}
          />
        </div>

        {/* ── OUTPUT + STDIN PANEL ── */}
        <div className={`flex min-h-0 flex-col overflow-hidden rounded-lg border ${c.panel}`}>

          {/* Tab bar */}
          <div className={`flex h-10 shrink-0 items-center gap-0 border-b px-2 ${c.header}`}>
            {/* Tabs */}
            {(["output","stdin"] as OutputTab[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition mr-1 ${
                  activeTab === tab ? c.tab : c.tabInactive
                }`}>
                {tab === "output"
                  ? <><Terminal className="h-3 w-3" />Output</>
                  : <><Type className="h-3 w-3" />Stdin</>
                }
              </button>
            ))}

            {/* Right side of tab bar */}
            <div className="ml-auto flex items-center gap-1">
              {/* Stats */}
              {result && !isRunning && (
                <div className="flex items-center gap-2 mr-2">
                  <span className={`flex items-center gap-1 text-xs ${c.muted}`}>
                    <Clock className="h-3 w-3" />{fmtTime(result.runtimeMs)}
                  </span>
                  {result.memoryKb && (
                    <span className={`text-xs ${c.muted}`}>{fmtMem(result.memoryKb)}</span>
                  )}
                  <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${
                    result.exitCode===0
                      ? "border-[#238636]/40 bg-[#238636]/10 text-[#3fb950]"
                      : "border-[#da3633]/40 bg-[#da3633]/10 text-[#f85149]"
                  }`}>
                    {result.exitCode===0 ? "✓ Passed" : `✗ Exit ${result.exitCode}`}
                  </span>
                </div>
              )}
              {isRunning && (
                <span className="flex items-center gap-1.5 text-xs text-[#58a6ff]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-[#58a6ff] opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-[#58a6ff]" />
                  </span>
                  Running…
                </span>
              )}
              {/* Copy output */}
              {result && !isRunning && activeTab==="output" && (
                <button onClick={copyOutput}
                  className={`grid h-7 w-7 place-items-center rounded-md transition ${c.icon}`} title="Copy output">
                  {copiedOut ? <Check className="h-3.5 w-3.5 text-[#3fb950]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
              {/* Clear */}
              {result && !isRunning && (
                <button onClick={() => setResult(null)}
                  className={`grid h-7 w-7 place-items-center rounded-md transition ${c.icon}`} title="Clear output">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Tab content */}
          <div className="min-h-0 flex-1 overflow-auto">
            {activeTab === "stdin" ? (
              /* ── STDIN tab ── */
              <div className="flex h-full flex-col p-3 gap-2">
                <p className={`text-xs ${c.muted}`}>
                  Custom input — will be passed as stdin when you run code
                </p>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter your input here...\nLine 1\nLine 2"
                  spellCheck={false}
                  className={`flex-1 resize-none rounded-lg border p-3 font-mono text-xs outline-none focus:border-[#58a6ff] transition ${c.input}`}
                />
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${c.muted}`}>{stdin.split("\n").length} line{stdin.split("\n").length!==1?"s":""}</span>
                  <button onClick={() => setStdin("")}
                    className={`text-xs transition ${c.muted} hover:text-[#f85149]`}>Clear</button>
                </div>
              </div>
            ) : (
              /* ── OUTPUT tab ── */
              <div className={`h-full p-4 font-mono text-sm ${c.outBody}`}>
                {isRunning ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#58a6ff]" />
                    <p className="text-xs text-[#8b949e]">Executing your code…</p>
                    {isCompiledLang && (
                      <p className="text-[11px] text-[#6e7681]">First run may take 30–60s (server cold start)</p>
                    )}
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    {result.stdout && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">stdout</p>
                        <pre className="whitespace-pre-wrap break-words leading-6 text-[#3fb950]">{result.stdout}</pre>
                      </div>
                    )}
                    {result.stderr && (
                      <div>
                        <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
                          <AlertCircle className="h-3 w-3 text-[#f85149]" />stderr
                        </div>
                        <pre className="whitespace-pre-wrap break-words leading-6 text-[#f85149]">{result.stderr}</pre>
                      </div>
                    )}
                    {!result.stdout && !result.stderr && (
                      <p className="text-xs text-[#8b949e]">
                        Program exited with code {result.exitCode}. No output produced.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#161b22]">
                        <Terminal className="h-6 w-6 text-[#8b949e]" />
                      </div>
                      <p className="text-sm font-semibold text-[#8b949e]">Output will appear here</p>
                      <p className="mt-2 text-xs text-[#6e7681]">
                        Press{" "}
                        <kbd className={`rounded border px-1.5 py-0.5 text-[10px] font-mono ${c.kbd}`}>Ctrl+Enter</kbd>
                        {" "}or click{" "}
                        <span className="font-semibold text-[#3fb950]">Run</span>
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {stdin.trim() && (
                          <span className="flex items-center gap-1 rounded-full bg-[#161b22] px-2 py-1 text-[11px] text-[#8b949e]">
                            <Type className="h-3 w-3" /> Custom stdin set
                          </span>
                        )}
                        {warming && (
                          <span className="flex items-center gap-1 rounded-full bg-[#161b22] px-2 py-1 text-[11px] text-amber-400">
                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-400" />Warming up engine
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className={`flex h-7 shrink-0 items-center justify-between border-t px-3 text-[11px] ${c.muted} border-[${isDark?"#30363d":"#d0d7de"}] ${isDark?"bg-[#161b22]":"bg-[#f6f8fa]"}`}>
            <span>
              {language==="Java" && <>Class must be named <code className="font-mono font-bold">Main</code></>}
              {language==="C++" && <><code className="font-mono">bits/stdc++.h</code> available</>}
              {language==="Python" && <><code className="font-mono">input()</code> reads from stdin</>}
              {language==="C#" && <>Class must have <code className="font-mono">static void Main()</code></>}
              {language==="SQL" && <>SQLite — only SELECT queries run</>}
              {!["Java","C++","Python","C#","SQL"].includes(language) && <>{language} · WohoCode Online Compiler</>}
            </span>
            <span className="flex items-center gap-2">
              <span>UTF-8</span>
              <span>|</span>
              <span>{fontSize}px</span>
            </span>
          </div>
        </div>
      </div>

      {/* ═════════════════ SHARE MODAL ══ */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowShare(false)}>
          <div className={`w-full max-w-md rounded-xl border p-5 shadow-2xl ${c.settingsBg}`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold">Share Code</h2>
              <button onClick={() => setShowShare(false)} className={`grid h-7 w-7 place-items-center rounded-md transition ${c.icon}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className={`mb-3 text-xs ${c.muted}`}>
              Your code is encoded in the URL — share it with anyone.
            </p>
            <div className="flex gap-2">
              <input readOnly value={shareUrl}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-mono outline-none ${c.input}`} />
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-[#238636] px-3 text-xs font-semibold text-white transition hover:bg-[#2ea043]">
                {copied ? <><Check className="h-3.5 w-3.5" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
              </button>
            </div>
            <p className={`mt-3 text-[11px] ${c.muted}`}>
              Language: <strong>{language}</strong> · Code length: {code.length} chars
            </p>
          </div>
        </div>
      )}

      {/* ═════════════════ SHORTCUTS PANEL ══ */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4" onClick={() => setShowSettings(false)}>
          <div className={`w-72 rounded-xl border p-4 shadow-2xl ${c.settingsBg}`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">Keyboard Shortcuts</h2>
              <button onClick={() => setShowSettings(false)} className={`grid h-7 w-7 place-items-center rounded-md transition ${c.icon}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
            {[
              ["Ctrl+Enter", "Run code"],
              ["Ctrl+S", "Save code"],
              ["Ctrl+/", "Toggle comment"],
              ["Ctrl+Z", "Undo"],
              ["Ctrl+Shift+Z", "Redo"],
              ["Alt+Shift+F", "Format code"],
              ["Ctrl+D", "Duplicate line"],
              ["Ctrl+X", "Cut line"],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between py-1.5">
                <span className={`text-xs ${c.muted}`}>{desc}</span>
                <kbd className={`rounded border px-1.5 py-0.5 text-[10px] font-mono ${c.kbd}`}>{key}</kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
