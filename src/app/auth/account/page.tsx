"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, LogOut, User, Mail, Trophy,
  CheckCircle2, Clock, Flame, ExternalLink,
} from "lucide-react";

type Analytics = {
  totalProblems: number;
  solvedProblems: number;
  attemptedProblems: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streakDays: number;
  score: number;
  rankLabel: string;
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login?callbackUrl=/auth/account");
    }
  }, [status, router]);

  // Fetch analytics
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/problems/analytics")
      .then((r) => r.json())
      .then((d) => setAnalytics(d))
      .catch(() => {});
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#333] border-t-pink-500" />
      </div>
    );
  }

  const user = session?.user;
  const initials = (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase();
  const solvedPct = analytics
    ? Math.round((analytics.solvedProblems / Math.max(analytics.totalProblems, 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-[#1e1e1e] px-4 py-3">
        <Link href="/problems"
          className="grid h-8 w-8 place-items-center rounded-lg text-[#555] hover:bg-[#1a1a1a] hover:text-white transition">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-bold text-white">My Account</span>
      </div>

      <div className="mx-auto max-w-lg px-4 py-8 space-y-4">

        {/* Profile card */}
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#111] p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {(user as any)?.image ? (
              <img src={(user as any).image} alt={user?.name ?? "User"}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-pink-500/30" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-2xl font-black text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black text-white">
                {user?.name ?? "WoHo User"}
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-[#666]">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{user?.email}</span>
              </div>
              {analytics?.rankLabel && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-bold text-pink-400">
                  <Trophy className="h-3 w-3" />
                  {analytics.rankLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {analytics && (
          <div className="rounded-2xl border border-[#1e1e1e] bg-[#111] p-5">
            <h2 className="mb-4 text-sm font-bold text-[#888] uppercase tracking-wider">Progress</h2>

            {/* Overall progress bar */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[#666]">Problems Solved</span>
                <span className="font-bold text-white">
                  {analytics.solvedProblems} / {analytics.totalProblems}
                  <span className="ml-1 text-[#555]">({solvedPct}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#1e1e1e]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all"
                  style={{ width: `${solvedPct}%` }}
                />
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Easy", value: analytics.easySolved, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Medium", value: analytics.mediumSolved, color: "text-amber-400", bg: "bg-amber-500/10" },
                { label: "Hard", value: analytics.hardSolved, color: "text-red-400", bg: "bg-red-500/10" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`rounded-xl ${bg} px-3 py-2.5 text-center`}>
                  <p className={`text-lg font-black ${color}`}>{value}</p>
                  <p className="text-[11px] text-[#666]">{label}</p>
                </div>
              ))}
            </div>

            {/* Streak + Score */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-[#1a1a1a] px-3 py-2.5">
                <Flame className="h-4 w-4 text-orange-400" />
                <div>
                  <p className="text-sm font-black text-white">{analytics.streakDays} days</p>
                  <p className="text-[10px] text-[#666]">Current Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-[#1a1a1a] px-3 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-sky-400" />
                <div>
                  <p className="text-sm font-black text-white">{analytics.score}</p>
                  <p className="text-[10px] text-[#666]">Total Score</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#111] overflow-hidden">
          <Link href="/problems"
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#1a1a1a] transition border-b border-[#1e1e1e]">
            <Clock className="h-4 w-4 text-[#555]" />
            <span className="text-sm font-medium text-[#ccc]">My Submissions</span>
          </Link>
          <a href="https://auth.wohotech.in/settings" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#1a1a1a] transition border-b border-[#1e1e1e]">
            <User className="h-4 w-4 text-[#555]" />
            <span className="text-sm font-medium text-[#ccc]">Edit Profile</span>
            <ExternalLink className="ml-auto h-3.5 w-3.5 text-[#444]" />
          </a>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 px-5 py-3.5 hover:bg-red-500/5 transition text-left"
          >
            <LogOut className="h-4 w-4 text-red-500/70" />
            <span className="text-sm font-medium text-red-400">Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
