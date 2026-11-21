"use client";

import { useEffect, useState } from "react";
import { Trophy, Sparkles, Zap } from "lucide-react";

type AcceptedFlashProps = {
  show: boolean;
  runtimeMs?: number;
  memoryMb?: number;
  onDismiss?: () => void;
  onNextProblem?: () => void;
};

/**
 * Full-screen celebration overlay when a solution is accepted.
 * Auto-dismisses after 3 seconds. Includes confetti particles + stats.
 */
export function AcceptedFlashOverlay({
  show,
  runtimeMs,
  memoryMb,
  onDismiss,
  onNextProblem,
}: AcceptedFlashProps) {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Generate confetti particles
      const colors = ["#22c55e", "#10b981", "#34d399", "#6ee7b7", "#fbbf24", "#f59e0b", "#3b82f6", "#8b5cf6"];
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={() => { setVisible(false); onDismiss?.(); }}
    >
      {/* Confetti particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute h-2 w-2 rounded-full animate-bounce opacity-80"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${0.8 + Math.random() * 0.6}s`,
          }}
        />
      ))}

      {/* Center card */}
      <div
        className="relative flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/90 to-green-900/90 px-12 py-10 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ring */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-green-400/10 to-emerald-500/20 blur-xl" />

        {/* Icon */}
        <div className="relative">
          <Trophy className="h-16 w-16 text-emerald-400 drop-shadow-lg" />
          <Sparkles className="absolute -right-2 -top-2 h-6 w-6 animate-pulse text-yellow-400" />
          <Zap className="absolute -bottom-1 -left-2 h-5 w-5 animate-pulse text-emerald-300" style={{ animationDelay: "0.3s" }} />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-emerald-400 drop-shadow-lg">Accepted!</h2>
          <p className="mt-1 text-sm text-emerald-200/70">All test cases passed</p>
        </div>

        {/* Stats */}
        {(runtimeMs !== undefined || memoryMb !== undefined) && (
          <div className="flex gap-6 text-center">
            {runtimeMs !== undefined && (
              <div>
                <p className="text-xs text-emerald-300/60">Runtime</p>
                <p className="text-lg font-bold text-white">{runtimeMs} ms</p>
              </div>
            )}
            {memoryMb !== undefined && (
              <div>
                <p className="text-xs text-emerald-300/60">Memory</p>
                <p className="text-lg font-bold text-white">{memoryMb.toFixed(1)} MB</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => { setVisible(false); onDismiss?.(); }}
            className="rounded-lg border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
          >
            Continue
          </button>
          {onNextProblem && (
            <button
              type="button"
              onClick={onNextProblem}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:from-emerald-400 hover:to-green-500"
            >
              Next Problem &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
