import { loader } from "@monaco-editor/react";

let configured = false;

/** Call once at app startup to configure Monaco's web worker URLs */
export function configureMonacoEnvironment() {
  if (configured || typeof window === "undefined") return;
  configured = true;

  // Use CDN workers — avoids bundling heavy workers into the app
  loader.config({
    paths: {
      vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.0/min/vs",
    },
  });
}

export type EditorThemeName = "woho-dark" | "woho-light";

/** Register custom WohoCode themes on the monaco instance */
export function defineEditorThemes(monaco: any) {
  monaco.editor.defineTheme("woho-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6e7681", fontStyle: "italic" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "string", foreground: "a5d6ff" },
      { token: "number", foreground: "79c0ff" },
      { token: "type", foreground: "ffa657" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#e6edf3",
      "editorLineNumber.foreground": "#6e7681",
      "editorLineNumber.activeForeground": "#e6edf3",
      "editor.selectionBackground": "#264f78",
      "editor.lineHighlightBackground": "#161b22",
      "editorCursor.foreground": "#58a6ff",
      "editor.inactiveSelectionBackground": "#1f2937",
    },
  });

  monaco.editor.defineTheme("woho-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6a737d", fontStyle: "italic" },
      { token: "keyword", foreground: "d73a49" },
      { token: "string", foreground: "032f62" },
      { token: "number", foreground: "005cc5" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#24292e",
      "editorLineNumber.foreground": "#babbbc",
      "editorLineNumber.activeForeground": "#24292e",
      "editor.selectionBackground": "#c8e1ff",
      "editor.lineHighlightBackground": "#f6f8fa",
      "editorCursor.foreground": "#0366d6",
    },
  });
}

/** Resolve theme name based on dark/light mode string */
export function resolveEditorTheme(theme: string | undefined): EditorThemeName {
  return theme === "light" ? "woho-light" : "woho-dark";
}
