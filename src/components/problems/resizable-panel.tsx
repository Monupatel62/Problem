"use client";

import { GripHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ResizablePanelProps = {
  top: React.ReactNode;
  bottom: React.ReactNode;
  minTop?: number;
  minBottom?: number;
  initialTopFraction?: number;
  storageKey?: string;
  dark?: boolean;
  className?: string;
};

export function ResizablePanel({
  top,
  bottom,
  minTop = 120,
  minBottom = 120,
  initialTopFraction = 0.62,
  storageKey = "wohotech-editor-split",
  dark = false,
  className = "",
}: ResizablePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const dragging = useRef(false);
  const startY = useRef(0);
  const startTopPx = useRef(0);
  const topHeightRef = useRef<number | null>(null);

  const [topHeight, setTopHeight] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const clamp = useCallback(
    (value: number, containerH: number) => {
      if (containerH <= 0) return value;
      return Math.min(Math.max(value, minTop), containerH - minBottom);
    },
    [minBottom, minTop],
  );

  const commitHeight = useCallback((height: number, containerH: number) => {
    const next = clamp(height, containerH);
    topHeightRef.current = next;
    setTopHeight(next);
  }, [clamp]);

  const resolveInitialHeight = useCallback((containerH: number) => {
    const raw = window.localStorage.getItem(storageKey);
    const stored = raw ? Number(raw) : NaN;
    const ideal = Number.isFinite(stored) && stored > 0
      ? stored
      : Math.round(containerH * initialTopFraction);
    return clamp(ideal, containerH);
  }, [clamp, initialTopFraction, storageKey]);

  const resetSplit = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerH = container.clientHeight;
    if (containerH <= 0) return;
    const next = clamp(Math.round(containerH * initialTopFraction), containerH);
    commitHeight(next, containerH);
    window.localStorage.removeItem(storageKey);
  }, [clamp, commitHeight, initialTopFraction, storageKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const syncLayout = () => {
      const containerH = container.clientHeight;
      setContainerHeight(containerH);
      if (containerH <= 0) return;

      if (topHeightRef.current === null) {
        commitHeight(resolveInitialHeight(containerH), containerH);
        return;
      }

      commitHeight(topHeightRef.current, containerH);
    };

    syncLayout();

    const observer = new ResizeObserver(() => {
      syncLayout();
    });
    observer.observe(container);

    window.addEventListener("resize", syncLayout);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncLayout);
    };
  }, [commitHeight, resolveInitialHeight]);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragging.current) return;
      const container = containerRef.current;
      if (!container) return;
      const raw = startTopPx.current + (e.clientY - startY.current);
      commitHeight(raw, container.clientHeight);
    }

    function onUp(e: PointerEvent) {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDraggingState(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      handleRef.current?.releasePointerCapture(e.pointerId);
      if (topHeightRef.current !== null) {
        window.localStorage.setItem(storageKey, String(Math.round(topHeightRef.current)));
      }
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [commitHeight, storageKey]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    startY.current = e.clientY;
    startTopPx.current = topHeightRef.current ?? Math.round(containerHeight * initialTopFraction);
    setIsDraggingState(true);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }

  const active = isHovered || isDraggingState;

  const topStyle =
    topHeight === null
      ? { flex: `${initialTopFraction} 1 0%`, minHeight: minTop }
      : { height: `${topHeight}px`, flexShrink: 0, minHeight: minTop };

  return (
    <div
      ref={containerRef}
      className={`flex h-full min-h-0 w-full flex-col overflow-hidden ${className}`.trim()}
    >
      <div style={topStyle} className="min-h-0 overflow-hidden">
        {top}
      </div>

      {/* ── Resize handle ─────────────────────────────────────────────────── */}
      <div
        ref={handleRef}
        role="separator"
        aria-orientation="horizontal"
        aria-valuemin={minTop}
        aria-valuemax={Math.max(minTop, containerHeight - minBottom)}
        aria-valuenow={topHeight ?? Math.round(containerHeight * initialTopFraction)}
        aria-label="Resize code editor and output panels"
        onPointerDown={onPointerDown}
        onDoubleClick={resetSplit}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Drag to resize · Double-click to reset"
        className={`group relative z-30 flex h-[18px] w-full shrink-0 cursor-row-resize touch-none select-none items-center justify-center transition-colors duration-150 ${
          isDraggingState
            ? dark ? "bg-orange-500/20" : "bg-orange-100"
            : active
              ? dark ? "bg-[#2d3f55]" : "bg-slate-200/80"
              : dark ? "bg-[#161f2e]" : "bg-[#e8edf3]"
        }`}
      >
        {/* Top border line */}
        <div
          className={`absolute inset-x-0 top-0 h-px transition-colors duration-150 ${
            isDraggingState
              ? dark ? "bg-orange-400" : "bg-orange-400"
              : active
                ? dark ? "bg-slate-500" : "bg-slate-400"
                : dark ? "bg-[#2a3a50]" : "bg-slate-300"
          }`}
        />

        {/* Bottom border line */}
        <div
          className={`absolute inset-x-0 bottom-0 h-px transition-colors duration-150 ${
            isDraggingState
              ? dark ? "bg-orange-400" : "bg-orange-400"
              : active
                ? dark ? "bg-slate-500" : "bg-slate-400"
                : dark ? "bg-[#2a3a50]" : "bg-slate-300"
          }`}
        />

        {/* Center pill with grip dots */}
        <div
          className={`pointer-events-none flex items-center gap-1.5 rounded-full px-3 py-[3px] transition-all duration-150 ${
            isDraggingState
              ? dark
                ? "bg-orange-500 shadow-lg shadow-orange-900/40"
                : "bg-orange-400 shadow-md shadow-orange-200"
              : active
                ? dark
                  ? "bg-[#334155] shadow-md"
                  : "bg-white shadow-md shadow-slate-200"
                : dark
                  ? "bg-[#253347]"
                  : "bg-white shadow-sm shadow-slate-200"
          }`}
        >
          {/* Six grip dots in 2 rows × 3 cols */}
          <div className="grid grid-cols-3 gap-[3px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-[3px] w-[3px] rounded-full transition-colors duration-150 ${
                  isDraggingState
                    ? "bg-white"
                    : active
                      ? dark ? "bg-orange-300" : "bg-orange-500"
                      : dark ? "bg-slate-500" : "bg-slate-400"
                }`}
              />
            ))}
          </div>
          <GripHorizontal
            className={`h-3 w-3 transition-colors duration-150 ${
              isDraggingState
                ? "text-white"
                : active
                  ? dark ? "text-orange-300" : "text-orange-500"
                  : dark ? "text-slate-500" : "text-slate-400"
            }`}
          />
          <div className="grid grid-cols-3 gap-[3px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-[3px] w-[3px] rounded-full transition-colors duration-150 ${
                  isDraggingState
                    ? "bg-white"
                    : active
                      ? dark ? "bg-orange-300" : "bg-orange-500"
                      : dark ? "bg-slate-500" : "bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Drag label — fades in on hover */}
        {active && (
          <span
            className={`absolute right-3 text-[10px] font-semibold ${
              isDraggingState
                ? dark ? "text-orange-300" : "text-orange-600"
                : dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {isDraggingState ? "Resizing…" : "Drag to resize"}
          </span>
        )}

        {/* Extra hit-area so the handle is easy to grab */}
        <div className="absolute inset-x-0 -top-2 -bottom-2" aria-hidden="true" />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden" style={{ minHeight: minBottom }}>
        {bottom}
      </div>
    </div>
  );
}
