"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface UsageData {
  planType: string;
  dailyQueryCount: number;
  queryLimit: number;
  queryRemaining: number;
  queryPercent: number;
  dailyImageCount: number;
  imageLimit: number;
}

export default function UsageBar() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
    // Refresh every 60 seconds
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUsage() {
    try {
      const res = await fetch("/api/user/usage", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }

  // Don't show while loading or for elite/enterprise users
  if (loading || !usage) return null;
  if (usage.planType === "elite" || usage.planType === "enterprise") return null;

  const percent = usage.queryPercent;
  const used = usage.dailyQueryCount;
  const limit = usage.queryLimit;

  // Color based on usage percentage
  let barColor = "#22c55e"; // green
  let textColor = "#22c55e";
  if (percent >= 80) {
    barColor = "#ef4444"; // red
    textColor = "#ef4444";
  } else if (percent >= 50) {
    barColor = "#eab308"; // yellow
    textColor = "#eab308";
  }

  return (
    <Link
      href="/payment"
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all hover:opacity-80 hover:scale-[1.02]"
      style={{
        background: "var(--surface-alt, rgba(255,255,255,0.05))",
        border: "1px solid var(--border, #2a2a4a)",
      }}
      title="View plans & top-up"
    >
      {/* Bolt icon */}
      <span style={{ color: textColor }}>⚡</span>

      {/* Progress bar */}
      <div
        className="w-16 h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--bg, #111)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(percent, 100)}%`,
            background: barColor,
          }}
        />
      </div>

      {/* Count */}
      <span
        className="font-medium whitespace-nowrap"
        style={{ color: "var(--text, #fff)" }}
      >
        {used}/{limit}
      </span>

      {/* Upgrade button (shows when >80%) */}
      {percent >= 80 && (
        <span
          className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          }}
        >
          Upgrade
        </span>
      )}
    </Link>
  );
}
