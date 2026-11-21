"use client";

import Editor, { loader, type BeforeMount, type OnMount } from "@monaco-editor/react";
import {
  Check,
  ChevronDown,
  Clipboard,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  configureMonacoEnvironment,
  defineEditorThemes,
  resolveEditorTheme,
} from "@/lib/monaco-setup";

configureMonacoEnvironment();

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python:     "#3572a5",
  "C++":      "#f34b7d",
  C:          "#555555",
  Java:       "#b07219",
  Go:         "#00add8",
  Rust:       "#dea584",
  Kotlin:     "#7f52ff",
  Ruby:       "#701516",
  PHP:        "#777bb4",
  "C#":       "#178600",
  SQL:        "#e38c00",
  Bash:       "#89e051",
};

type CodeEditorProps = {
  value: string;
  language: string;
  languages: readonly string[];
  savedAt: string;
  disabled?: boolean;
  theme?: "light" | "dark";
  fontSize?: number;
  showRunButton?: boolean;
  onChange: (value: string) => void;
  onLanguageChange: (language: string) => void;
  onRun: () => void;
  onSave: () => void;
  onReset?: () => void;
};

const monacoLanguageMap: Record<string, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Python: "python",
  "C++": "cpp",
  C: "c",
  Java: "java",
  Go: "go",
  Rust: "rust",
  Kotlin: "kotlin",
  Ruby: "ruby",
  PHP: "php",
  "C#": "csharp",
  SQL: "sql",
  Bash: "shell",
};

const fileExtensionMap: Record<string, string> = {
  JavaScript: "js",
  TypeScript: "ts",
  Python: "py",
  Java: "java",
  "C++": "cpp",
  C: "c",
  Go: "go",
  Rust: "rs",
  Kotlin: "kt",
  Ruby: "rb",
  PHP: "php",
  "C#": "cs",
  SQL: "sql",
  Bash: "sh",
};

export function CodeEditor({
  value,
  language,
  languages,
  savedAt,
  disabled,
  theme = "dark",
  fontSize = 14,
  showRunButton = true,
  onChange,
  onLanguageChange,
  onRun,
  onSave,
  onReset,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [monacoReady, setMonacoReady] = useState(false);
  const [monacoConfigured, setMonacoConfigured] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";
  const monacoLanguage = useMemo(() => monacoLanguageMap[language] ?? "javascript", [language]);

  // Load Monaco from local npm package
  useEffect(() => {
    let cancelled = false;
    void import("monaco-editor").then((monacoModule) => {
      if (cancelled) return;
      loader.config({ monaco: monacoModule });
      setMonacoConfigured(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Font size sync — no padding here to avoid gutter reset bug
  useEffect(() => {
    editorRef.current?.updateOptions({ fontSize: localFontSize });
  }, [localFontSize]);

  // Warmup judge service for compiled languages
  useEffect(() => {
    if (language === "JavaScript" || language === "SQL") return;
    const controller = new AbortController();
    fetch("/api/problems/judge/warmup", { method: "POST", signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (toolbarRef.current?.contains(event.target as Node)) return;
      setShowLanguageMenu(false);
      setShowSettings(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleBeforeMount: BeforeMount = (monaco) => {
    defineEditorThemes(monaco);
    monaco.editor.setTheme(resolveEditorTheme(isDark));
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setMonacoReady(true);
    editor.updateOptions({ padding: { top: 18, bottom: 18 } });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onRun);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, onSave);
    editor.onDidChangeCursorPosition((event) => {
      setCursor({ line: event.position.lineNumber, column: event.position.column });
    });
    // Suppress browser autofill popup on Monaco's hidden textarea
    const domNode = editor.getDomNode();
    if (domNode) {
      const ta = domNode.querySelector("textarea");
      if (ta) {
        ta.setAttribute("autocomplete", "off");
        ta.setAttribute("autocorrect", "off");
        ta.setAttribute("autocapitalize", "off");
        ta.setAttribute("spellcheck", "false");
        ta.setAttribute("data-lpignore", "true");
        ta.setAttribute("data-1p-ignore", "true");
        ta.setAttribute("readonly", "true");
        window.setTimeout(() => ta.removeAttribute("readonly"), 100);
      }
    }
    editor.focus();
  };

  useEffect(() => {
    if (!monacoReady || !monacoRef.current) return;
    monacoRef.current.editor.setTheme(resolveEditorTheme(isDark));
  }, [isDark, monacoReady]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function downloadCode() {
    const ext = fileExtensionMap[language] ?? "txt";
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `solution.${ext}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`flex h-full w-full flex-col overflow-hidden ${
      isFullscreen ? "fixed inset-0 z-[200]" : ""
    } ${isDark ? "bg-[#1a1a1a]" : "bg-white"}`}>

      {/* ── Toolbar ── */}
      <div
        ref={toolbarRef}
        className={`flex h-[42px] shrink-0 items-center justify-between gap-2 border-b px-3 ${
          isDark ? "border-[#3d3d3d] bg-[#282828]" : "border-slate-200 bg-slate-50"
        }`}
      >
        {/* Language selector */}
        <div className="relative min-w-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowLanguageMenu((open) => !open)}
            className={`inline-flex h-7 items-center gap-2 rounded px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isDark ? "text-[#eff1f3] hover:bg-[#333]" : "text-slate-900 hover:bg-white hover:shadow-sm"
            }`}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: LANG_COLORS[language] ?? "#888" }}
            />
            <span className="truncate">{language}</span>
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition ${showLanguageMenu ? "rotate-180" : ""}`} />
          </button>

          {showLanguageMenu && (
            <div className={`absolute left-0 top-9 z-50 w-44 overflow-hidden rounded-lg border py-1 shadow-xl ${
              isDark ? "border-[#3d3d3d] bg-[#2a2a2a]" : "border-slate-200 bg-white"
            }`}>
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onLanguageChange(lang); setShowLanguageMenu(false); }}
                  className={`flex h-8 w-full items-center gap-2.5 px-3 text-xs font-medium transition ${
                    lang === language
                      ? isDark ? "bg-[#333] text-[#ffa116]" : "bg-emerald-50 text-emerald-700"
                      : isDark ? "text-[#ccc] hover:bg-[#333] hover:text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: LANG_COLORS[lang] ?? "#888" }}
                  />
                  <span>{lang}</span>
                  {lang === language && <Check className="ml-auto h-3 w-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1" />

        {/* Right tools */}
        <div className="flex shrink-0 items-center gap-0.5">
          <span className={`mr-2 hidden max-w-[130px] truncate text-[11px] sm:block ${isDark ? "text-[#888]" : "text-slate-400"}`}>
            {savedAt}
          </span>

          <div className={`mr-1 hidden h-4 w-px sm:block ${isDark ? "bg-[#3d3d3d]" : "bg-slate-200"}`} />

          {onReset && (
            <button type="button" onClick={onReset} title="Reset to starter code"
              className={`grid h-7 w-7 place-items-center rounded transition ${isDark ? "text-[#888] hover:bg-[#333] hover:text-[#eff1f3]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          <button type="button" onClick={copyCode} title="Copy code"
            className={`grid h-7 w-7 place-items-center rounded transition ${isDark ? "text-[#888] hover:bg-[#333] hover:text-[#eff1f3]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
          </button>

          <button type="button" onClick={downloadCode} title="Download solution"
            className={`grid h-7 w-7 place-items-center rounded transition ${isDark ? "text-[#888] hover:bg-[#333] hover:text-[#eff1f3]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* Settings */}
          <div className="relative">
            <button type="button" onClick={() => setShowSettings((o) => !o)} title="Editor settings"
              className={`grid h-7 w-7 place-items-center rounded transition ${
                showSettings
                  ? isDark ? "bg-[#3d3d3d] text-[#eff1f3]" : "bg-white text-slate-800 shadow-sm"
                  : isDark ? "text-[#888] hover:bg-[#333] hover:text-[#eff1f3]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}>
              <Settings2 className="h-3.5 w-3.5" />
            </button>
            {showSettings && (
              <div className={`absolute right-0 top-9 z-50 w-52 rounded-lg border p-3 shadow-xl ${
                isDark ? "border-[#3d3d3d] bg-[#2a2a2a] text-[#eff1f3]" : "border-slate-200 bg-white text-slate-900"
              }`}>
                <p className={`mb-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-[#888]" : "text-slate-400"}`}>
                  Editor Settings
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">Font size</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setLocalFontSize((s) => Math.max(10, s - 1))}
                      className={`h-6 w-6 rounded text-sm font-bold ${isDark ? "bg-[#333] hover:bg-[#3d3d3d]" : "bg-slate-100 hover:bg-slate-200"}`}>
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-mono">{localFontSize}</span>
                    <button type="button" onClick={() => setLocalFontSize((s) => Math.min(24, s + 1))}
                      className={`h-6 w-6 rounded text-sm font-bold ${isDark ? "bg-[#333] hover:bg-[#3d3d3d]" : "bg-slate-100 hover:bg-slate-200"}`}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <div className={`mx-1 h-4 w-px ${isDark ? "bg-[#3d3d3d]" : "bg-slate-200"}`} />
          <button type="button" onClick={() => setIsFullscreen((f) => !f)}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className={`grid h-7 w-7 place-items-center rounded transition ${
              isFullscreen
                ? isDark ? "bg-[#3d3d3d] text-[#eff1f3]" : "bg-white text-slate-800 shadow-sm"
                : isDark ? "text-[#888] hover:bg-[#333] hover:text-[#eff1f3]" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}>
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Monaco Editor ── */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {monacoConfigured ? (
          <Editor
            height="100%"
            value={value}
            language={monacoLanguage}
            theme={resolveEditorTheme(isDark)}
            beforeMount={handleBeforeMount}
            loading={null}
            onMount={handleEditorMount}
            onChange={(newValue) => onChange(newValue ?? "")}
            options={{
              readOnly: disabled,
              minimap: { enabled: false },
              fontSize: localFontSize,
              fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, 'Cascadia Code', Consolas, monospace",
              fontLigatures: true,
              lineHeight: Math.round(localFontSize * 1.75),
              tabSize: 4,
              insertSpaces: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: "off",
              renderLineHighlight: "line",
              renderWhitespace: "selection",
              roundedSelection: false,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              cursorStyle: "line",
              cursorWidth: 2,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: "active", indentation: true },
              matchBrackets: "always",
              suggestOnTriggerCharacters: true,
              quickSuggestions: { other: true, comments: false, strings: false },
              formatOnPaste: true,
              formatOnType: false,
              smoothScrolling: true,
              mouseWheelZoom: true,
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
                useShadows: false,
              },
              overviewRulerBorder: false,
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              folding: true,
              foldingHighlight: true,
              showFoldingControls: "mouseover",
              lineNumbers: "on",
              glyphMargin: false,
              fixedOverflowWidgets: true,
            }}
          />
        ) : (
          <div className={`grid h-full place-items-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Loading editor...
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      <div className={`flex h-7 shrink-0 items-center justify-between gap-3 border-t px-3 text-[11px] ${
        isDark ? "border-[#2a2a2a] bg-[#1a1a1a] text-[#555]" : "border-slate-100 bg-slate-50 text-slate-400"
      }`}>
        <span className="font-mono">Ln {cursor.line}, Col {cursor.column}</span>
        <span className="truncate">{`${monacoLanguage} | Ctrl+Enter: run | Ctrl+S: save`}</span>
      </div>
    </div>
  );
}
