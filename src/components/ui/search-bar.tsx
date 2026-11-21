"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import {
  getDirectMatchResult,
  getSiteSearchResults,
  getSiteSearchSuggestions,
  getTypeLabel,
  isQuestionLikeQuery,
} from "@/lib/search/site-search";

type SearchItem = {
  title: string;
  href: string;
  type: "note" | "coding" | "tool" | "page" | "feature" | "course" | "video" | "reel" | "post" | "image";
  meta: string;
  description?: string;
  keywords?: string[];
};

type Props = {
  items: SearchItem[];
  enableGlobalShortcut?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
};

type SearchResult = {
  item: SearchItem;
  score: number;
  matchedTokens: string[];
};

type RemoteSuggestion = {
  text: string;
  reason: string;
};

type StoredRecentSearch = {
  value: string;
  timestamp: number;
};

const RECENT_SEARCHES_KEY = "wohotech_recent_searches";
const RECENT_SEARCH_TTL_MS = 30 * 60 * 1000;

function getFuzzyPositions(text: string, query: string): number[] | null {
  const source = text.toLowerCase();
  const target = query.toLowerCase();
  const positions: number[] = [];
  let cursor = 0;

  for (const char of target) {
    const found = source.indexOf(char, cursor);
    if (found === -1) return null;
    positions.push(found);
    cursor = found + 1;
  }

  return positions;
}

function getScore(item: SearchItem, query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const title = item.title.toLowerCase();
  const meta = item.meta.toLowerCase();
  const description = (item.description ?? "").toLowerCase();
  const keywords = item.keywords ?? [];

  let score = 0;
  const titleIndex = title.indexOf(q);
  const metaIndex = meta.indexOf(q);
  const descIndex = description.indexOf(q);
  const keywordMatch = keywords.some((keyword) => keyword.toLowerCase().includes(q));

  if (title.startsWith(q)) score += 120;
  if (titleIndex >= 0) score += 100 - Math.min(titleIndex, 30);
  if (meta.startsWith(q)) score += 80;
  if (metaIndex >= 0) score += 50 - Math.min(metaIndex, 20);
  if (descIndex >= 0) score += 20;
  if (keywordMatch) score += 40;

  const titleFuzzy = getFuzzyPositions(title, q);
  if (titleFuzzy) {
    const spread = titleFuzzy[titleFuzzy.length - 1] - titleFuzzy[0];
    score += 30 - Math.min(spread, 20);
  }

  return score;
}

function highlightText(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const exactIndex = lowerText.indexOf(lowerQuery);

  if (exactIndex >= 0) {
    const before = text.slice(0, exactIndex);
    const match = text.slice(exactIndex, exactIndex + q.length);
    const after = text.slice(exactIndex + q.length);
    return (
      <>
        {before}
        <mark className="rounded bg-[var(--accent)]/30 px-0.5 text-[var(--text)]">{match}</mark>
        {after}
      </>
    );
  }

  const fuzzy = getFuzzyPositions(text, q);
  if (!fuzzy) return text;

  return text.split("").map((char, index) =>
    fuzzy.includes(index) ? (
      <mark key={`${char}-${index}`} className="rounded bg-[var(--accent)]/25 px-0.5 text-[var(--text)]">
        {char}
      </mark>
    ) : (
      <span key={`${char}-${index}`}>{char}</span>
    ),
  );
}

export function SearchBar({
  items,
  enableGlobalShortcut = false,
  placeholder = "Search pages, tools, notes, courses, features...",
  autoFocus = false,
}: Props) {
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [, startTransition] = useTransition();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeType, setActiveType] = useState<"all" | SearchItem["type"]>("all");
  const [remoteSuggestions, setRemoteSuggestions] = useState<RemoteSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);

  // Debounce the query for heavy search computations (150ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDebouncedQuery("");
      return;
    }
    const timer = window.setTimeout(() => {
      startTransition(() => setDebouncedQuery(trimmed));
    }, 150);
    return () => window.clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    const value = debouncedQuery;
    if (!value || value.length < 2) return [];

    const semantic = getSiteSearchResults(items, value, {
      limit: 8,
      type: activeType,
    });

    return semantic.map((entry) => ({
      item: entry.item,
      score: entry.score,
      matchedTokens: entry.matchedTokens,
    }));
  }, [activeType, items, debouncedQuery]);

  const suggestions = useMemo(() => getSiteSearchSuggestions(items, debouncedQuery), [items, debouncedQuery]);

  const hasQuestionLikeQuery = useMemo(() => isQuestionLikeQuery(debouncedQuery), [debouncedQuery]);
  const directMatch = useMemo(() => getDirectMatchResult(results, debouncedQuery), [debouncedQuery, results]);

  const resultTypes = useMemo(() => {
    const types = new Set(results.map((result) => result.item.type));
    return ["all", ...Array.from(types)] as Array<"all" | SearchItem["type"]>;
  }, [results]);

  const mergedSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const combined = [...remoteSuggestions, ...suggestions]
      .filter((item) => {
        const key = item.text.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6);
    return combined;
  }, [remoteSuggestions, suggestions]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Array<string | StoredRecentSearch>;
      if (Array.isArray(parsed)) {
        const cutoff = Date.now() - RECENT_SEARCH_TTL_MS;
        const cleaned = parsed
          .map((item) =>
            typeof item === "string"
              ? { value: item, timestamp: Date.now() }
              : item,
          )
          .filter((item): item is StoredRecentSearch => Boolean(item?.value))
          .filter((item) => item.timestamp >= cutoff)
          .slice(0, 6);

        setRecentSearches(cleaned.map((item) => item.value));
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(cleaned));
      }
    } catch {
      // Ignore local storage parse issues.
    }
  }, []);

  // Fetch trending searches on mount
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/search/analytics?action=trending&limit=8");
        if (!response.ok) return;
        const payload = (await response.json()) as { trending?: string[] };
        if (!cancelled && payload.trending) {
          setTrendingSearches(payload.trending);
        }
      } catch {
        // Ignore fetch errors for trending searches
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setRemoteSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=5${activeType === "all" ? "" : `&type=${activeType}`}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as { suggestions?: RemoteSuggestion[] };
        setRemoteSuggestions(payload.suggestions ?? []);
      } catch {
        // Ignore fetch cancellation / suggestion errors.
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [activeType, query]);

  useEffect(() => {
    if (!enableGlobalShortcut) return;

    function onShortcut(event: KeyboardEvent) {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (isCmdOrCtrl && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [enableGlobalShortcut]);

  useEffect(() => {
    if (!autoFocus) return;
    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    return () => window.clearTimeout(timeout);
  }, [autoFocus]);

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && query.trim()) {
      event.preventDefault();
      navigateToSearchTarget(
        `/search?q=${encodeURIComponent(query.trim())}${activeType === "all" ? "" : `&type=${activeType}`}`,
      );
      return;
    }

    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const target = activeIndex === 0 && directMatch ? directMatch : results[activeIndex];
      if (target) {
        navigateToSearchTarget(target.item.href, target.item as any);
      }
    }

    if (event.key === "Escape") {
      setQuery("");
      setActiveIndex(0);
    }
  }

  function persistRecentSearch(value: string) {
    const normalized = value.trim();
    if (!normalized) return;

    setRecentSearches((prev) => {
      const next = [normalized, ...prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 6);
      try {
        const now = Date.now();
        const payload: StoredRecentSearch[] = next.map((item, index) => ({
          value: item,
          timestamp: index === 0 && item === normalized ? now : now,
        }));
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(payload));
      } catch {
        // Ignore local storage write issues.
      }
      return next;
    });
  }

  function removeRecentSearch(value: string) {
    const target = value.trim().toLowerCase();
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item.toLowerCase() !== target);
      try {
        const payload: StoredRecentSearch[] = next.map((item) => ({
          value: item,
          timestamp: Date.now(),
        }));
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(payload));
      } catch {
        // Ignore local storage write issues.
      }
      return next;
    });
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore local storage remove issues.
    }
  }

  function recordAnalytics(action: "search" | "click" | "suggestion", value: string, resultCount?: number, type?: string) {
    const queryValue = value.trim();
    if (!queryValue) return;

    void fetch("/api/search/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        query: queryValue,
        resultCount,
        type,
      }),
    }).catch(() => {
      // Ignore analytics transport errors.
    });
  }

  function navigateToSearchTarget(href: string, item?: SearchItem) {
    if (item) {
      persistRecentSearch(query);
      recordAnalytics("click", query, results.length, item.type);
      } else {
      persistRecentSearch(query);
      recordAnalytics("search", query, results.length, activeType);
    }

    setIsOpen(false);
    router.push(href);
  }

  function runSearchQuery(value: string, source: "recent" | "suggestion") {
    const clean = value.trim();
    if (!clean) return;

    const exactResults = getSiteSearchResults(items, clean, {
      limit: 8,
      type: activeType,
    }).map((entry) => ({
      item: entry.item,
      score: entry.score,
      matchedTokens: entry.matchedTokens,
    }));
    const exactDirectMatch = getDirectMatchResult(exactResults, clean);

    persistRecentSearch(clean);
    recordAnalytics(source === "suggestion" ? "suggestion" : "search", clean, results.length, activeType);
    setQuery(clean);
    setIsOpen(false);
    router.push(
      exactDirectMatch
        ? exactDirectMatch.item.href
        : `/search?q=${encodeURIComponent(clean)}${activeType === "all" ? "" : `&type=${activeType}`}`,
    );
  }

  return (
    <div className="relative">
      {enableGlobalShortcut ? <p className="mb-1 text-right text-[10px] font-bold text-[var(--muted)]">Ctrl/Cmd + K</p> : null}
      <input
        suppressHydrationWarning
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
        }}
        onFocus={() => {
          if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
          setIsOpen(true);
        }}
        onBlur={() => {
          closeTimeoutRef.current = window.setTimeout(() => setIsOpen(false), 120);
        }}
        onKeyDown={onInputKeyDown}
        placeholder={placeholder}
        className="w-full rounded-full border border-[#dfe1e5] dark:border-[#5f6368] bg-white dark:bg-[#303134] px-4 pr-12 py-3 text-sm font-medium text-[#202124] dark:text-[#e8eaed] shadow-sm outline-none transition-all duration-300 placeholder:text-[#9aa0a6] focus:border-[#dfe1e5] dark:focus:border-[#5f6368] focus:bg-white dark:focus:bg-[#303134] focus:shadow-[0_1px_6px_rgba(32,33,36,0.28)] dark:focus:shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
      />
      <button
        type="button"
        title={isListening ? "Listening..." : "Voice search"}
        onMouseDown={(e) => e.preventDefault()}
        className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 transition ${
          isListening
            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse"
            : "text-[#9aa0a6] hover:text-[#4285f4] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043]"
        }`}
        onClick={() => {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (!SpeechRecognition) {
            alert("Voice search is not supported in this browser. Please use Chrome or Edge.");
            return;
          }
          const recognition = new SpeechRecognition();
          recognition.lang = "hi-IN";
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;
          recognition.continuous = false;
          recognition.onstart = () => setIsListening(true);
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            setIsListening(false);
            setIsOpen(true);
            inputRef.current?.focus();
          };
          recognition.onerror = (e: any) => {
            console.error("Speech recognition error:", e.error);
            setIsListening(false);
            if (e.error === "not-allowed") {
              alert("Mic permission denied. Please allow microphone access in browser settings.");
            }
          };
          recognition.onend = () => setIsListening(false);
          recognition.start();
        }}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
      </button>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-[3.75rem] z-20 overflow-hidden rounded-[24px] border border-slate-200/80 dark:border-[#3c4043] bg-white/96 dark:bg-[#303134]/96 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
          {query.trim() ? (
            <div className="rounded-[20px] border border-slate-100 dark:border-[#3c4043] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#fff7fb_100%)] dark:bg-[#202124] p-3">
              <div className="flex flex-wrap gap-2">
                {resultTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setActiveType(type);
                      setActiveIndex(0);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] shadow-sm transition-all duration-300 hover:-translate-y-0.5 ${
                      activeType === type
                        ? "border-blue-500 bg-[linear-gradient(135deg,#2563eb,#7c3aed)] text-white shadow-[0_10px_24px_rgba(37,99,235,0.25)]"
                        : "border-slate-200 dark:border-[#5f6368] bg-white dark:bg-[#303134] text-slate-500 dark:text-[#bdc1c6] hover:border-blue-200 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                    }`}
                  >
                    {type === "all" ? "All" : getTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!query.trim() ? (
            <div className="px-2 py-3">
              {recentSearches.length > 0 ? (
                <>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-[#9aa0a6]">Recent Searches</p>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={clearRecentSearches}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-[#5f6368] bg-white dark:bg-[#303134] text-slate-500 dark:text-[#9aa0a6] shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-500"
                      aria-label="Clear recent searches"
                      title="Clear recent searches"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 7h16" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M6 7l1 13h10l1-13" />
                        <path d="M9 7V4h6v3" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 overflow-hidden rounded-full border border-slate-200 dark:border-[#5f6368] bg-white dark:bg-[#303134] text-[11px] font-bold text-slate-600 dark:text-[#bdc1c6] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-200 dark:hover:border-pink-500 hover:shadow-[0_8px_18px_rgba(219,39,119,0.1)]"
                      >
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => runSearchQuery(item, "recent")}
                          className="px-3 py-1.5 transition hover:text-pink-600"
                        >
                          {item}
                        </button>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => removeRecentSearch(item)}
                          className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 dark:text-[#9aa0a6] transition hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
                          aria-label={`Delete ${item} from recent searches`}
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {trendingSearches.length > 0 ? (
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-[#9aa0a6]">
                        <svg viewBox="0 0 24 24" className="mr-1 inline h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        Trending Searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => runSearchQuery(item, "suggestion")}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-[#5f6368] bg-white dark:bg-[#303134] px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-[#bdc1c6] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-[0_8px_18px_rgba(37,99,235,0.1)]"
                          >
                            <svg viewBox="0 0 24 24" className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                              <polyline points="17 6 23 6 23 12" />
                            </svg>
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#5f6368] bg-slate-50/80 dark:bg-[#303134]/80 px-4 py-4 text-center">
                      <p className="text-sm font-medium text-slate-500 dark:text-[#9aa0a6]">
                        Search subjects, tools, courses & more
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-[#6e7681]">
                        Try: DBMS, Python, DSA, OS, WoHo AI
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : results.length > 0 ? (
            <div className="pt-1">
              {directMatch ? (
                <div className="border-b border-slate-100 dark:border-[#3c4043] px-2 py-2">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => navigateToSearchTarget(directMatch.item.href, directMatch.item as any)}
                    className="flex w-full items-center justify-between rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-left shadow-sm transition hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white dark:hover:bg-blue-900/30 hover:shadow-[0_10px_24px_rgba(37,99,235,0.12)]"
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">Exact Match</p>
                      <p className="mt-0.5 text-sm font-semibold text-[var(--text)]">{directMatch.item.title}</p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--primary)]">Open</span>
                  </button>
                </div>
              ) : null}
              {results.map((result, index) => (
                <Link
                  href={result.item.href}
                  key={`${result.item.href}-${result.item.title}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    persistRecentSearch(query);
                    setIsOpen(false);
                  }}
                  className={`block rounded-2xl px-3 py-2 text-xs transition-all duration-300 ${
                    index === activeIndex
                      ? "bg-slate-100 dark:bg-[#303134] text-[var(--text)] shadow-sm"
                      : "text-[var(--muted)] hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-[#303134] hover:text-[var(--text)] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-[var(--accent)]">
                        {result.item.type} | {highlightText(result.item.meta, query)}
                      </p>
                      <p className="mt-0.5 text-xs">{highlightText(result.item.title, query)}</p>
                    </div>
                    <p className="shrink-0 text-[10px] font-semibold text-[var(--muted)]">
                      {Math.round(result.score)}
                    </p>
                  </div>
                  {result.item.description ? (
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--muted)]">
                      {highlightText(result.item.description, query)}
                    </p>
                  ) : null}
                  {result.matchedTokens.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {result.matchedTokens.slice(0, 3).map((token) => (
                        <span
                          key={`${result.item.href}-${token}`}
                          className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]"
                        >
                          {token}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="mx-2 my-3 rounded-2xl border border-dashed border-slate-200 dark:border-[#5f6368] bg-slate-50 dark:bg-[#303134] px-4 py-3 text-xs text-[var(--muted)]">
              <p className="font-semibold text-[var(--text)]">No direct match found.</p>
              <p className="mt-1">This topic does not appear to be available inside WoHoTech. Try Ask AI for guidance.</p>
            </div>
          )}

          {query.trim() && mergedSuggestions.length > 0 ? (
            <div className="border-t border-slate-100 dark:border-[#3c4043] px-2 py-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-[#9aa0a6]">Smart Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {mergedSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => runSearchQuery(suggestion.text, "suggestion")}
                    className="rounded-full border border-slate-200 dark:border-[#5f6368] bg-white dark:bg-[#303134] px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-[#bdc1c6] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 hover:shadow-[0_8px_18px_rgba(124,58,237,0.1)]"
                    title={suggestion.reason}
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {query.trim() ? (
            <div className="border-t border-slate-100 dark:border-[#3c4043] px-2 py-3">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search"}
                  onClick={() => {
                    if (query.trim()) persistRecentSearch(query);
                    setIsOpen(false);
                  }}
                  className="rounded-full border border-slate-200 dark:border-[#5f6368] bg-white dark:bg-[#303134] px-4 py-2 text-[12px] font-black text-slate-700 dark:text-[#bdc1c6] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-[0_10px_20px_rgba(37,99,235,0.12)]"
                >
                  {directMatch ? "Open more results" : "Open full search"}
                </Link>
                <Link
                  href={`/assistant?intent=chat&prompt=${encodeURIComponent(
                    hasQuestionLikeQuery
                      ? query.trim()
                      : `Help me find the right WoHoTech page, tool, note, or course for: ${query.trim()}`,
                  )}`}
                  onClick={() => {
                    persistRecentSearch(query);
                    setIsOpen(false);
                  }}
                  className="rounded-full border border-blue-400 bg-[linear-gradient(135deg,#2563eb,#7c3aed)] px-4 py-2 text-[12px] font-black text-white shadow-[0_10px_22px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(37,99,235,0.32)]"
                >
                  Ask AI
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
