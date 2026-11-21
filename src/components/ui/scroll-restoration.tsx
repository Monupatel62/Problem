"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

const STORAGE_PREFIX = "scroll-pos:";
const MAX_RESTORE_ATTEMPTS = 8;

function buildStorageKey(routeKey: string) {
  return `${STORAGE_PREFIX}${routeKey}`;
}

function safeSessionGet(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage can be blocked in embedded previews such as AdSense.
  }
}

function restoreScrollPosition(targetY: number, attempt = 0) {
  const maxScrollableY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clampedY = Math.min(targetY, maxScrollableY);
  window.scrollTo({ top: clampedY, left: 0, behavior: "auto" });

  if (attempt >= MAX_RESTORE_ATTEMPTS || maxScrollableY >= targetY || Math.abs(window.scrollY - clampedY) < 2) {
    return;
  }

  window.setTimeout(() => restoreScrollPosition(targetY, attempt + 1), 120);
}

export function ScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const previousRouteKeyRef = useRef(routeKey);
  const shouldRestoreRef = useRef(false);

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    const saveScrollPosition = () => {
      safeSessionSet(buildStorageKey(previousRouteKeyRef.current), String(window.scrollY));
    };

    const handlePopState = () => {
      shouldRestoreRef.current = true;
    };

    window.addEventListener("beforeunload", saveScrollPosition);
    window.addEventListener("pagehide", saveScrollPosition);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", saveScrollPosition);
      window.removeEventListener("pagehide", saveScrollPosition);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const previousRouteKey = previousRouteKeyRef.current;
    if (previousRouteKey !== routeKey) {
      safeSessionSet(buildStorageKey(previousRouteKey), String(window.scrollY));
      previousRouteKeyRef.current = routeKey;
    }

    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const shouldRestore = shouldRestoreRef.current || navEntry?.type === "back_forward";

    if (!shouldRestore) return;

    const savedY = safeSessionGet(buildStorageKey(routeKey));
    if (!savedY) {
      shouldRestoreRef.current = false;
      return;
    }

    shouldRestoreRef.current = false;
    window.requestAnimationFrame(() => restoreScrollPosition(Number(savedY)));
  }, [routeKey]);

  return null;
}
