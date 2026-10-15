import type { Monaco } from "@monaco-editor/react";

export const DARK_THEME_ID = "lc-dark";
export const LIGHT_THEME_ID = "lc-light";

/** Must run before Monaco loads so language workers tokenize code from the local package. */
export function configureMonacoEnvironment(): void {
  if (typeof window === "undefined") return;

  type MonacoWindow = Window & {
    __monacoEnvConfigured?: boolean;
    MonacoEnvironment?: {
      getWorkerUrl?: (workerId: string, label: string) => string;
      getWorker?: (workerId: string, label: string) => Worker;
    };
  };

  const win = window as MonacoWindow;
  if (win.__monacoEnvConfigured) return;
  win.__monacoEnvConfigured = true;

  // Monaco editor workers - use inline worker to avoid CSP cross-origin issues
  // The worker code is minimal - it just bootstraps the actual Monaco worker logic
  win.MonacoEnvironment = {
    getWorker(_workerId: string, label: string): Worker {
      const cdnBase = "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs";
      let workerUrl: string;

      if (label === "json") {
        workerUrl = `${cdnBase}/language/json/json.worker.js`;
      } else if (label === "css" || label === "scss" || label === "less") {
        workerUrl = `${cdnBase}/language/css/css.worker.js`;
      } else if (label === "html" || label === "handlebars" || label === "razor") {
        workerUrl = `${cdnBase}/language/html/html.worker.js`;
      } else if (label === "typescript" || label === "javascript") {
        workerUrl = `${cdnBase}/language/typescript/ts.worker.js`;
      } else {
        workerUrl = `${cdnBase}/editor/editor.worker.js`;
      }

      // Create a same-origin worker using data URI that fetches and evals the CDN script
      // This bypasses both CSP script-src restrictions and cross-origin Worker limitations
      const workerCode = `
        self.onmessage = function() {};
        try {
          importScripts("${workerUrl}");
        } catch(e) {
          console.warn("[Monaco Worker] importScripts failed, falling back to fetch+eval:", e.message);
          fetch("${workerUrl}")
            .then(r => r.text())
            .then(code => { (0, eval)(code); })
            .catch(e2 => console.error("[Monaco Worker] fetch+eval also failed:", e2));
        }
      `;

      const blob = new Blob([workerCode], { type: "text/javascript" });
      return new Worker(URL.createObjectURL(blob));
    },
  };
}


export function defineEditorThemes(monaco: Monaco): void {
  monaco.editor.defineTheme(DARK_THEME_ID, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7280", fontStyle: "italic" },
      { token: "comment.line", foreground: "6b7280", fontStyle: "italic" },
      { token: "comment.block", foreground: "6b7280", fontStyle: "italic" },
      { token: "keyword", foreground: "f97316" },
      { token: "keyword.control", foreground: "f97316" },
      { token: "storage.type", foreground: "f97316" },
      { token: "string", foreground: "a3e635" },
      { token: "string.quoted", foreground: "a3e635" },
      { token: "number", foreground: "60a5fa" },
      { token: "constant.numeric", foreground: "60a5fa" },
      { token: "variable", foreground: "eff1f3" },
      { token: "variable.parameter", foreground: "e2e8f0" },
      { token: "type", foreground: "34d399" },
      { token: "entity.name.type", foreground: "34d399" },
      { token: "entity.name.class", foreground: "34d399" },
      { token: "entity.name.function", foreground: "fbbf24" },
      { token: "support.function", foreground: "fbbf24" },
      { token: "meta.function-call", foreground: "fbbf24" },
      { token: "operator", foreground: "94a3b8" },
      { token: "punctuation", foreground: "94a3b8" },
    ],
    colors: {
      "editor.background": "#1a1a1a",
      "editor.foreground": "#eff1f3",
      "editorLineNumber.foreground": "#555560",
      "editorLineNumber.activeForeground": "#c9c9d0",
      "editorCursor.foreground": "#fbbf24",
      "editor.selectionBackground": "#3b82f620",
      "editor.selectionHighlightBackground": "#3b82f610",
      "editor.lineHighlightBackground": "#262626",
      "editor.lineHighlightBorder": "#00000000",
      "editorGutter.background": "#1a1a1a",
      "editorIndentGuide.background1": "#2d2d2d",
      "editorIndentGuide.activeBackground1": "#525252",
      "editorBracketMatch.background": "#fbbf2420",
      "editorBracketMatch.border": "#fbbf2460",
      "editorWidget.background": "#1f1f1f",
      "editorSuggestWidget.background": "#1f1f1f",
      "editorSuggestWidget.border": "#3f3f46",
      "editorSuggestWidget.selectedBackground": "#27272a",
      "editorHoverWidget.background": "#1f1f1f",
      "editorHoverWidget.border": "#3f3f46",
      "scrollbarSlider.background": "#3f3f4660",
      "scrollbarSlider.hoverBackground": "#52525280",
      "scrollbarSlider.activeBackground": "#71717a80",
      "editorOverviewRuler.border": "#00000000",
    },
  });

  monaco.editor.defineTheme(LIGHT_THEME_ID, {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "9ca3af", fontStyle: "italic" },
      { token: "keyword", foreground: "dc2626" },
      { token: "string", foreground: "16a34a" },
      { token: "number", foreground: "2563eb" },
      { token: "type", foreground: "7c3aed" },
      { token: "entity.name.function", foreground: "b45309" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#111827",
      "editorLineNumber.foreground": "#d1d5db",
      "editorLineNumber.activeForeground": "#6b7280",
      "editorCursor.foreground": "#111827",
      "editor.selectionBackground": "#bfdbfe80",
      "editor.lineHighlightBackground": "#f9fafb",
      "editor.lineHighlightBorder": "#00000000",
      "editorGutter.background": "#ffffff",
      "editorIndentGuide.background1": "#e5e7eb",
      "editorIndentGuide.activeBackground1": "#9ca3af",
      "editorWidget.background": "#f9fafb",
      "editorSuggestWidget.background": "#f9fafb",
      "editorSuggestWidget.border": "#e5e7eb",
      "editorSuggestWidget.selectedBackground": "#eff6ff",
      "scrollbarSlider.background": "#e5e7eb80",
      "scrollbarSlider.hoverBackground": "#d1d5db80",
    },
  });
}

export function resolveEditorTheme(isDark: boolean): string {
  return isDark ? DARK_THEME_ID : LIGHT_THEME_ID;
}
