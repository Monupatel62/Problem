import type { ProblemCase, ProblemDefinition } from "@/lib/problems/bank";

// ─── Judge Types ──────────────────────────────────────────────────────────────
export type JudgeStatus = "Idle" | "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error";
export type BottomPanel = "Testcase" | "Test Result";
export type ProblemPanel = "Description" | "Editorial" | "Solutions" | "Submissions";

export type JudgeResult = {
  status: JudgeStatus;
  passed: number;
  total: number;
  runtimeMs: number;
  memoryMb: number;
  message: string;
  failedCase?: { input: unknown[]; expected: unknown; actual?: unknown };
  testResults?: Array<{
    caseNumber: number;
    status: "Accepted" | "Wrong Answer" | "Runtime Error";
    input: unknown[];
    expected: unknown;
    actual?: unknown;
    runtimeMs: number;
    memoryMb: number;
    message?: string;
  }>;
};

// ─── Submission Types ─────────────────────────────────────────────────────────
export type SubmissionSummary = {
  id: string;
  language: string;
  status: string;
  passed: number;
  total: number;
  runtimeMs: number;
  memoryMb: number;
  message?: string;
  createdAt: string;
};

export type SubmissionDetail = SubmissionSummary & {
  code: string;
  testResults?: JudgeResult["testResults"];
  problem?: { slug: string; title: string; difficulty: string; tags: string[] };
};

export type SubmissionAnalytics = {
  totalSubmissions: number;
  acceptedSubmissions: number;
  failedSubmissions: number;
  acceptanceRate: number;
  bestRuntimeMs: number | null;
  bestMemoryMb: number | null;
  averageRuntimeMs: number | null;
  languages: Array<{ language: string; count: number; accepted: number }>;
  lastSubmittedAt?: string;
};

// ─── Language Types ───────────────────────────────────────────────────────────
export const languages = ["JavaScript", "TypeScript", "Python", "C++", "C", "Java", "Go", "Rust", "Kotlin", "Ruby", "PHP", "C#", "SQL", "Bash"] as const;
export type LanguageName = (typeof languages)[number];
export type LanguageStatus = {
  status: "enabled" | "external-service" | "docker-disabled";
  label: string;
  message: string;
};

export const defaultLanguageStatuses: Record<LanguageName, LanguageStatus> = {
  JavaScript: { status: "enabled", label: "Live", message: "Runs on the built-in WoHoTech JavaScript judge." },
  TypeScript: { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  Python: { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  "C++": { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  C: { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  Java: { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  Go: { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  Rust: { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  Kotlin: { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  Ruby: { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  PHP: { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  "C#": { status: "external-service", label: "Live", message: "Runs through the WoHoTech external judge service." },
  SQL: { status: "external-service", label: "Live", message: "SQL queries run through the WoHoTech judge." },
  Bash: { status: "external-service", label: "Live", message: "Shell scripts run through the WoHoTech judge." },
};

// ─── Color Token System ───────────────────────────────────────────────────────
export type ColorTokens = {
  root: string;
  header: string;
  headerText: string;
  mobileBar: string;
  main: string;
  panel: string;
  panelTab: string;
  tabActive: string;
  tabInactive: string;
  editorPanel: string;
  outputPanel: string;
  outputTab: string;
  runnerBar: string;
  resultCard: string;
  caseCard: string;
  caseSlot: string;
  footerBar: string;
  btnRun: string;
  divider: string;
  muted: string;
  sub: string;
  customBorder: string;
  textarea: string;
  chipSelected: string;
  chipIdle: string;
  msgCard: string;
  statCard: string;
};

export const darkTokens: ColorTokens = {
  root: "bg-[#0b1220] text-slate-100",
  header: "bg-[#111827] border-[#1e293b]",
  headerText: "text-slate-100",
  mobileBar: "bg-[#111827] border-[#1e293b]",
  main: "bg-[#0f172a]",
  panel: "bg-[#1a2235] border-[#1e293b]",
  panelTab: "bg-[#131c2e] border-[#1e293b]",
  tabActive: "border-sky-400 text-sky-400",
  tabInactive: "border-transparent text-slate-500 hover:text-slate-300",
  editorPanel: "bg-[#1a1a2e] border-[#1e293b]",
  outputPanel: "bg-[#1a2235] border-[#1e293b]",
  outputTab: "bg-[#131c2e] border-[#1e293b]",
  runnerBar: "bg-[#131c2e] border-[#1e293b]",
  resultCard: "bg-[#0f172a] ring-[#1e293b]",
  caseCard: "bg-[#0f172a] border-[#1e293b]",
  caseSlot: "bg-[#1a1a2e]",
  footerBar: "bg-[#131c2e] border-[#1e293b]",
  btnRun: "bg-[#1e293b] border border-[#334155] text-slate-200 hover:bg-[#334155]",
  divider: "bg-[#1e293b]",
  muted: "text-slate-500",
  sub: "text-slate-400",
  customBorder: "border-[#1e293b] bg-[#131c2e]",
  textarea: "bg-[#0f172a] border-[#334155] text-slate-100 placeholder:text-slate-600",
  chipSelected: "bg-sky-600 text-white",
  chipIdle: "bg-[#1e293b] text-slate-400 hover:bg-[#334155]",
  msgCard: "bg-[#0f172a] ring-[#1e293b] text-slate-100",
  statCard: "bg-[#0f172a] ring-[#1e293b] text-slate-100",
};

export const lightTokens: ColorTokens = {
  root: "bg-[#f0f4f8] text-slate-900",
  header: "bg-white border-slate-200",
  headerText: "text-slate-900",
  mobileBar: "bg-white border-slate-200",
  main: "bg-[#e8eef5]",
  panel: "bg-white border-slate-200",
  panelTab: "bg-[#f8fafc] border-slate-100",
  tabActive: "border-sky-500 text-sky-600",
  tabInactive: "border-transparent text-slate-500 hover:text-slate-800",
  editorPanel: "bg-white border-slate-200",
  outputPanel: "bg-white border-slate-200",
  outputTab: "bg-[#f8fafc] border-slate-100",
  runnerBar: "bg-[#f0f8ff] border-blue-100",
  resultCard: "bg-white ring-slate-100",
  caseCard: "bg-white border-slate-200",
  caseSlot: "bg-slate-50",
  footerBar: "bg-white border-slate-100",
  btnRun: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  divider: "bg-slate-200",
  muted: "text-slate-400",
  sub: "text-slate-500",
  customBorder: "border-slate-200 bg-white",
  textarea: "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400",
  chipSelected: "bg-slate-900 text-white",
  chipIdle: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  msgCard: "bg-white ring-slate-100 text-slate-800",
  statCard: "bg-white ring-slate-100 text-slate-900",
};

// ─── Utility Functions ────────────────────────────────────────────────────────
export function formatInput(testCase: ProblemCase | { input: unknown[]; expected: unknown; actual?: unknown }) {
  if (testCase.input && !Array.isArray(testCase.input) && typeof testCase.input === "object") {
    return Object.entries(testCase.input as unknown as Record<string, unknown[]>)
      .map(([table, rows]) => `${table}: ${JSON.stringify(rows)}`)
      .join(" | ");
  }
  return (testCase.input as unknown[]).map((item) => JSON.stringify(item)).join(", ");
}

export function formatUnknown(value: unknown) {
  if (typeof value === "undefined") return "\u2014";
  if (typeof value === "string") return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

export function difficultyStyle(d: string) {
  if (d === "Easy") return "text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800";
  if (d === "Hard") return "text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800";
  return "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800";
}

export function resultTone(status: JudgeStatus) {
  if (status === "Accepted") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Idle") return "border-slate-200 bg-slate-50 text-slate-500";
  return "border-rose-300 bg-rose-50 text-rose-700";
}

export function caseTone(status: "Accepted" | "Wrong Answer" | "Runtime Error") {
  if (status === "Accepted") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

export function todayKey() { return new Date().toISOString().slice(0, 10); }

export function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(window.localStorage.getItem(key) ?? "") as T; }
  catch { return fallback; }
}

export function emptyAnalytics(): SubmissionAnalytics {
  return {
    totalSubmissions: 0, acceptedSubmissions: 0, failedSubmissions: 0, acceptanceRate: 0,
    bestRuntimeMs: null, bestMemoryMb: null, averageRuntimeMs: null, languages: [],
  };
}

export function buildLocalAnalytics(submissions: SubmissionSummary[]): SubmissionAnalytics {
  if (!submissions.length) return emptyAnalytics();
  const accepted = submissions.filter((s) => s.status === "Accepted");
  const langMap = new Map<string, { language: string; count: number; accepted: number }>();
  for (const s of submissions) {
    const cur = langMap.get(s.language) ?? { language: s.language, count: 0, accepted: 0 };
    cur.count++;
    if (s.status === "Accepted") cur.accepted++;
    langMap.set(s.language, cur);
  }
  return {
    totalSubmissions: submissions.length,
    acceptedSubmissions: accepted.length,
    failedSubmissions: submissions.length - accepted.length,
    acceptanceRate: Math.round((accepted.length / submissions.length) * 100),
    bestRuntimeMs: accepted.length ? Math.min(...accepted.map((s) => s.runtimeMs)) : null,
    bestMemoryMb: accepted.length ? Math.min(...accepted.map((s) => s.memoryMb)) : null,
    averageRuntimeMs: accepted.length
      ? Math.round(accepted.reduce((t, s) => t + s.runtimeMs, 0) / accepted.length)
      : null,
    languages: Array.from(langMap.values()).sort((a, b) => b.count - a.count),
    lastSubmittedAt: submissions[0]?.createdAt,
  };
}
