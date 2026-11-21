"use client";

import { CheckCircle2, Play, RotateCcw, Send, XCircle } from "lucide-react";
import type { ProblemCase, ProblemDefinition } from "@/lib/problems/bank";
import { type BottomPanel, type ColorTokens, type JudgeResult, caseTone, formatInput, formatUnknown, resultTone } from "./practice-types";
import { TestCasesPanel } from "./test-cases-panel";

function JudgingPulse({ active, dark }: { active: boolean; dark: boolean }) {
  if (!active) return null;
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold ${dark ? "text-sky-400" : "text-sky-600"}`}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
      </span>
      Judging...
    </div>
  );
}

type TestResultsPanelProps = {
  problem: ProblemDefinition;
  isDark: boolean;
  c: ColorTokens;
  result: JudgeResult;
  isJudging: boolean;
  canJudge: boolean;
  hasResult: boolean;
  activeBottomPanel: BottomPanel;
  activeCases: ProblemCase[];
  // Test cases panel passthrough
  isSpecialProblem: boolean;
  isSqlProblem: boolean;
  selectedSampleCases: number[];
  customCases: ProblemCase[];
  customInput: string;
  customExpected: string;
  customCaseError: string;
  selectedCases: ProblemCase[];
  judgeUnavailableMessage: string;
  // Actions
  onSetBottomPanel: (panel: BottomPanel) => void;
  onToggleSampleCase: (i: number) => void;
  onCustomInputChange: (value: string) => void;
  onCustomExpectedChange: (value: string) => void;
  onAddCustomCase: () => void;
  onRemoveCustomCase: (i: number) => void;
  onRun: () => void;
  onSubmit: () => void;
};

export function TestResultsPanel({
  problem,
  isDark,
  c,
  result,
  isJudging,
  canJudge,
  hasResult,
  activeBottomPanel,
  activeCases,
  isSpecialProblem,
  isSqlProblem,
  selectedSampleCases,
  customCases,
  customInput,
  customExpected,
  customCaseError,
  selectedCases,
  judgeUnavailableMessage,
  onSetBottomPanel,
  onToggleSampleCase,
  onCustomInputChange,
  onCustomExpectedChange,
  onAddCustomCase,
  onRemoveCustomCase,
  onRun,
  onSubmit,
}: TestResultsPanelProps) {
  return (
    <div id="test-panel" className={`flex h-full flex-col overflow-hidden ${c.outputPanel}`}>
      {/* Output tab bar */}
      <div className={`flex h-10 shrink-0 items-center justify-between border-b px-3 ${c.outputTab}`}>
        <div className="flex items-center gap-3">
          {/* Testcase tab */}
          <button
            type="button"
            onClick={() => onSetBottomPanel("Testcase")}
            className={`inline-flex h-10 items-center gap-1.5 border-b-2 text-xs font-semibold transition ${
              activeBottomPanel === "Testcase"
                ? isDark ? "border-orange-400 text-orange-400" : "border-orange-500 text-orange-600"
                : isDark ? "border-transparent text-slate-500 hover:text-slate-300" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            Testcase
          </button>

          {/* Test Result tab */}
          <button
            type="button"
            onClick={() => onSetBottomPanel("Test Result")}
            className={`inline-flex h-10 items-center gap-1.5 border-b-2 text-xs font-semibold transition ${
              activeBottomPanel === "Test Result"
                ? isDark ? "border-orange-400 text-orange-400" : "border-orange-500 text-orange-600"
                : isDark ? "border-transparent text-slate-500 hover:text-slate-300" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            {result.status === "Accepted" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : result.status === "Idle" ? (
              <RotateCcw className={`h-3.5 w-3.5 ${c.muted}`} />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-rose-500" />
            )}
            Test Result
          </button>

          {/* Pass counter */}
          {hasResult && !isJudging && (
            <span className={`text-[11px] font-semibold ${
              result.status === "Accepted" ? "text-emerald-500" : c.muted
            }`}>
              {result.passed}/{result.total}
            </span>
          )}
          {isJudging && <JudgingPulse active dark={isDark} />}
        </div>

        {/* Status pill */}
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${resultTone(result.status)}`}>
          {result.status}
        </span>
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeBottomPanel === "Testcase" ? (
          <TestCasesPanel
            problem={problem}
            isDark={isDark}
            c={c}
            isSpecialProblem={isSpecialProblem}
            isSqlProblem={isSqlProblem}
            selectedSampleCases={selectedSampleCases}
            customCases={customCases}
            customInput={customInput}
            customExpected={customExpected}
            customCaseError={customCaseError}
            selectedCases={selectedCases}
            judgeUnavailableMessage={judgeUnavailableMessage}
            onToggleSampleCase={onToggleSampleCase}
            onCustomInputChange={onCustomInputChange}
            onCustomExpectedChange={onCustomExpectedChange}
            onAddCustomCase={onAddCustomCase}
            onRemoveCustomCase={onRemoveCustomCase}
          />
        ) : (
          /* Test Result tab */
          <div className="grid gap-3 p-3 text-sm">
            {/* Status card + stats */}
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div className={`rounded-lg p-3 ring-1 ${c.msgCard}`}>
                <p className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${c.muted}`}>Message</p>
                <p className={`text-sm leading-6 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  {isJudging ? "Judging..." : result.message}
                </p>
                {result.failedCase && !isJudging && (
                  <div className={`mt-2 grid gap-1 rounded-md border p-2 font-mono text-xs ${
                    isDark ? "border-rose-900/40 bg-rose-950/30 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}>
                    <p><span className="font-bold">Input: </span>{formatInput(result.failedCase)}</p>
                    <p><span className="font-bold">Expected: </span>{formatUnknown(result.failedCase.expected)}</p>
                    <p><span className="font-bold">Got: </span>{formatUnknown(result.failedCase.actual)}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
                <div className={`rounded-lg p-3 text-center ring-1 ${c.statCard}`}>
                  <p className={`text-[10px] ${c.muted}`}>Runtime</p>
                  <p className="mt-1 text-sm font-bold">{hasResult ? `${result.runtimeMs} ms` : "\u2014"}</p>
                </div>
                <div className={`rounded-lg p-3 text-center ring-1 ${c.statCard}`}>
                  <p className={`text-[10px] ${c.muted}`}>Memory</p>
                  <p className="mt-1 text-sm font-bold">{hasResult ? `${result.memoryMb.toFixed(1)} MB` : "\u2014"}</p>
                </div>
              </div>
            </div>

            {/* Per-case breakdown */}
            {result.testResults?.length ? (
              <div className="grid gap-2">
                {result.testResults.map((tr) => (
                  <div key={tr.caseNumber} className={`rounded-lg border p-3 ${c.caseCard}`}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${caseTone(tr.status)}`}>
                        Case {tr.caseNumber}: {tr.status}
                      </span>
                      <span className={`text-[11px] ${c.muted}`}>{tr.runtimeMs} ms | {tr.memoryMb.toFixed(1)} MB</span>
                    </div>
                    <div className={`grid gap-2 font-mono text-xs sm:grid-cols-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {[
                        { label: "Input", value: tr.input.map(formatUnknown).join(", ") },
                        { label: "Expected", value: formatUnknown(tr.expected) },
                        { label: "Output", value: formatUnknown(tr.actual) },
                      ].map(({ label, value }) => (
                        <div key={label} className={`rounded-md p-2 ${c.caseSlot}`}>
                          <p className={`mb-1 font-sans text-[10px] font-bold uppercase tracking-widest ${c.muted}`}>{label}</p>
                          <p className="break-words">{value}</p>
                        </div>
                      ))}
                    </div>
                    {tr.message && (
                      <p className="mt-1.5 text-[11px] font-semibold text-rose-500">{tr.message}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer: case count + Run/Submit */}
      <div className={`flex shrink-0 items-center justify-between gap-3 border-t px-3 py-2 ${c.footerBar}`}>
        <p className={`text-[11px] font-medium ${c.muted}`}>
          {activeBottomPanel === "Testcase" ? selectedCases.length : activeCases.length} cases
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isJudging || !canJudge}
            onClick={onRun}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${c.btnRun}`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isJudging ? "Running..." : "Run"}
          </button>
          <button
            type="button"
            disabled={isJudging || !canJudge}
            onClick={onSubmit}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-green-600 px-4 text-xs font-bold text-white transition hover:from-emerald-400 hover:to-green-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {isJudging ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
