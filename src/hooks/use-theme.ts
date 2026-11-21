"use client";

import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "woho_theme"; // must match site-header.tsx

export type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    const resolved = next === "system" ? getSystemTheme() : next;
    setThemeState(next);
    localStorage.setItem(THEME_KEY, resolved);
    applyTheme(next);
    // Dispatch storage event so other components (e.g. SiteHeader) sync immediately
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_KEY, newValue: resolved }));
  }, []);

  return { theme, setTheme };
}
