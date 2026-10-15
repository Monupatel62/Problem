"use client";

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusColor(status: string) {
  if (status === "Accepted") return "text-emerald-600";
  if (status === "Wrong Answer") return "text-rose-600";
  return "text-orange-500";
}

function caseTone(status: string) {
  if (status === "Accepted") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function formatUnknown(v: unknown) {
  if (typeof v === "undefined") return "\u2014";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────
type Props = {
  submissions: SubmissionSummary[];
  analytics: SubmissionAnalytics;
  source: "database" | "local";
  selectedSubmission: SubmissionDetail | null;
  isLoadingDetail: boolean;
  detailMessage: string;
  dark?: boolean;
  onSelectSubmission: (s: SubmissionSummary) => void;
};

// ─── Submissions Tab Component ───────────────────────────────────────────────
export function ProblemSubmissionsTab({
  submissions,
  analytics,
  source,
  selectedSubmission,
  isLoadingDetail,
  detailMessage,
  dark = false,
  onSelectSubmission,
}: Props) {
  const t = {
    primary: dark ? "text-slate-100" : "text-slate-900",
    secondary: dark ? "text-slate-400" : "text-slate-500",
    border: dark ? "border-[#1e293b]" : "border-slate-200",
    surface: dark ? "bg-[#1a2235]" : "bg-slate-50",
    row: dark
      ? "bg-[#1a2235] hover:bg-[#1e293b] border-[#1e293b]"
      : "bg-white hover:bg-slate-50 border-slate-100",
    rowActive: dark ? "bg-[#1e293b]" : "bg-sky-50/60",
    stat: dark ? "bg-[#1a2235] border-[#1e293b]" : "bg-white border-slate-200",
    detail: dark ? "bg-[#0f172a] text-slate-300" : "bg-slate-50 text-slate-700",
    code: dark ? "bg-[#0a0a0a] text-slate-100" : "bg-slate-950 text-slate-100",
  };

  return (
    <div className="px-5 py-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          {
            label: "Total",
            value: analytics.totalSubmissions,
            sub: `${analytics.acceptedSubmissions} accepted`,
          },
          {
            label: "Rate",
            value: `${analytics.acceptanceRate}%`,
            sub: `${analytics.failedSubmissions} failed`,
          },
          {
            label: "Best Runtime",
            value: analytics.bestRuntimeMs === null ? "\u2013" : `${analytics.bestRuntimeMs} ms`,
            sub:
              analytics.averageRuntimeMs === null
                ? "no data"
                : `avg ${analytics.averageRuntimeMs} ms`,
          },
          {
            label: "Best Memory",
            value:
              analytics.bestMemoryMb === null
                ? "\u2013"
                : `${analytics.bestMemoryMb.toFixed(1)} MB`,
            sub: analytics.lastSubmittedAt
              ? new Date(analytics.lastSubmittedAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })
              : "no data",
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className={`rounded-lg border p-3 ${t.stat}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${t.secondary}`}>
              {label}
            </p>
            <p className={`mt-1 text-lg font-black ${t.primary}`}>{value}</p>
            <p className={`mt-0.5 text-[11px] ${t.secondary}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Sync badge */}
      <div className="mb-4 flex items-center justify-between">
        <p className={`text-sm font-semibold ${t.primary}`}>History</p>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
            source === "database"
              ? dark
                ? "border-emerald-800 text-emerald-400"
                : "border-emerald-200 text-emerald-700"
              : dark
                ? "border-[#2d2d2d] text-slate-500"
                : "border-slate-200 text-slate-400"
          }`}
        >
          {source === "database" ? "Synced" : "Local only"}
        </span>
      </div>

      {/* Submission list */}
      <div className={`overflow-hidden rounded-lg border ${t.border}`}>
        {submissions.length > 0 ? (
          <>
            {/* Header */}
            <div
              className={`grid grid-cols-[1fr_70px_64px_80px] gap-2 border-b px-4 py-2 text-[10px] font-semibold uppercase tracking-wide ${t.secondary} ${t.border} ${t.surface}`}
            >
              <span>Status</span>
              <span>Lang</span>
              <span>Passed</span>
              <span>Time</span>
            </div>
            {submissions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSubmission(s)}
                className={`grid w-full grid-cols-[1fr_70px_64px_80px] gap-2 border-b px-4 py-3 text-left text-sm last:border-b-0 transition ${
                  selectedSubmission?.id === s.id ? t.rowActive : t.row
                } ${t.border}`}
              >
                <div>
                  <p className={`font-semibold text-xs ${statusColor(s.status)}`}>{s.status}</p>
                  {s.message && (
                    <p className={`mt-0.5 line-clamp-1 text-[11px] ${t.secondary}`}>
                      {s.message}
                    </p>
                  )}
                </div>
                <span className={`text-xs self-center ${t.secondary}`}>{s.language}</span>
                <span className={`text-xs self-center ${t.secondary}`}>
                  {s.passed}/{s.total}
                </span>
                <span className={`text-[11px] self-center ${t.secondary}`}>
                  {new Date(s.createdAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </button>
            ))}
          </>
        ) : (
          <div className={`px-4 py-10 text-center text-sm font-medium ${t.secondary} ${t.surface}`}>
            No submissions yet. Run or submit a solution to start tracking.
          </div>
        )}
      </div>

      {/* Detail panel */}
      <div className={`mt-4 rounded-lg border ${t.border}`}>
        <div className={`flex items-center justify-between border-b px-4 py-3 ${t.border}`}>
          <p className={`text-sm font-semibold ${t.primary}`}>Submission detail</p>
          {selectedSubmission && (
            <span className={`text-xs font-bold ${statusColor(selectedSubmission.status)}`}>
              {selectedSubmission.status}
            </span>
          )}
        </div>

        {isLoadingDetail ? (
          <div className={`px-4 py-8 text-center text-sm ${t.secondary}`}>Loading\u2026</div>
        ) : selectedSubmission ? (
          <div className="p-4 space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Language", value: selectedSubmission.language },
                { label: "Passed", value: `${selectedSubmission.passed}/${selectedSubmission.total}` },
                { label: "Runtime", value: `${selectedSubmission.runtimeMs} ms` },
                { label: "Memory", value: `${selectedSubmission.memoryMb.toFixed(1)} MB` },
              ].map(({ label, value }) => (
                <div key={label} className={`rounded-md p-3 ${t.surface}`}>
                  <p className={`text-[10px] font-semibold uppercase ${t.secondary}`}>{label}</p>
                  <p className={`mt-1 font-bold text-sm ${t.primary}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Message */}
            {selectedSubmission.message && (
              <div className={`rounded-md p-3 text-sm ${t.detail}`}>
                <p className={`text-[10px] font-semibold uppercase mb-1 ${t.secondary}`}>
                  Message
                </p>
                {selectedSubmission.message}
              </div>
            )}

            {/* Test result replay */}
            {selectedSubmission.testResults?.length ? (
              <div className="space-y-2">
                <p className={`text-xs font-semibold ${t.secondary}`}>Testcase replay</p>
                {selectedSubmission.testResults.map((tr) => (
                  <div
                    key={tr.caseNumber}
                    className={`rounded-lg border p-3 ${t.border} ${
                      tr.status === "Accepted"
                        ? ""
                        : dark
                          ? "bg-rose-950/10"
                          : "bg-rose-50/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${caseTone(tr.status)}`}
                      >
                        Case {tr.caseNumber}: {tr.status}
                      </span>
                      <span className={`text-[11px] ${t.secondary}`}>
                        {tr.runtimeMs} ms | {tr.memoryMb.toFixed(1)} MB
                      </span>
                    </div>
                    <div
                      className={`grid gap-2 font-mono text-xs sm:grid-cols-3 ${
                        dark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {[
                        { label: "Input", value: tr.input.map(formatUnknown).join(", ") },
                        { label: "Expected", value: formatUnknown(tr.expected) },
                        { label: "Output", value: formatUnknown(tr.actual) },
                      ].map(({ label, value }) => (
                        <div key={label} className={`rounded p-2 ${t.surface}`}>
                          <p
                            className={`mb-1 font-sans text-[10px] font-semibold uppercase tracking-wide ${t.secondary}`}
                          >
                            {label}
                          </p>
                          <p className="break-words">{value}</p>
                        </div>
                      ))}
                    </div>
                    {tr.message && (
                      <p className="mt-2 text-[11px] font-semibold text-rose-600">{tr.message}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${t.secondary}`}>
                No testcase replay data for this submission.
              </p>
            )}

            {/* Code */}
            <div>
              <p className={`text-xs font-semibold mb-2 ${t.secondary}`}>Code</p>
              <pre
                className={`max-h-80 overflow-auto rounded-lg p-4 text-xs leading-6 ${t.code}`}
              >
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>
          </div>
        ) : (
          <div className={`px-4 py-8 text-center text-sm ${t.secondary}`}>
            {detailMessage || "Select a submission from the list above to inspect it."}
          </div>
        )}
      </div>
    </div>
  );
}
