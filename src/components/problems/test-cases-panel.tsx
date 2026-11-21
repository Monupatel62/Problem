"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProblemCase, ProblemDefinition } from "@/lib/problems/bank";
import { type ColorTokens, formatInput, formatUnknown } from "./practice-types";

type TestCasesPanelProps = {
  problem: ProblemDefinition;
  isDark: boolean;
  c: ColorTokens;
  isSpecialProblem: boolean;
  isSqlProblem: boolean;
  selectedSampleCases: number[];
  customCases: ProblemCase[];
  customInput: string;
  customExpected: string;
  customCaseError: string;
  selectedCases: ProblemCase[];
  judgeUnavailableMessage: string;
  onToggleSampleCase: (i: number) => void;
  onCustomInputChange: (value: string) => void;
  onCustomExpectedChange: (value: string) => void;
  onAddCustomCase: () => void;
  onRemoveCustomCase: (i: number) => void;
};

export function TestCasesPanel({
  problem,
  isDark,
  c,
  isSpecialProblem,
  isSqlProblem,
  selectedSampleCases,
  customCases,
  customInput,
  customExpected,
  customCaseError,
  selectedCases,
  judgeUnavailableMessage,
  onToggleSampleCase,
  onCustomInputChange,
  onCustomExpectedChange,
  onAddCustomCase,
  onRemoveCustomCase,
}: TestCasesPanelProps) {
  return (
    <div className="grid gap-3 p-3 text-sm">
      {/* Case chips - normal problems */}
      {!isSpecialProblem && (
        <div className="flex flex-wrap gap-2">
          {problem.sampleCases.map((_, idx) => {
            const sel = selectedSampleCases.includes(idx);
            return (
              <button
                key={`${problem.slug}-case-${idx}`}
                type="button"
                onClick={() => onToggleSampleCase(idx)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${sel ? c.chipSelected : c.chipIdle}`}
              >
                Case {idx + 1}
              </button>
            );
          })}
          {customCases.map((_, idx) => (
            <span key={`custom-${idx}`} className="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
              Custom {idx + 1}
            </span>
          ))}
        </div>
      )}

      {/* SQL case chips - no toggle */}
      {isSpecialProblem && (
        <div className="flex flex-wrap gap-2">
          {problem.sampleCases.map((_, idx) => (
            <span key={`sp-case-${idx}`} className={`rounded-md px-3 py-1.5 text-xs font-bold ${c.chipSelected}`}>
              Case {idx + 1}
            </span>
          ))}
        </div>
      )}

      {/* Case data preview */}
      <div className={`rounded-lg border p-3 text-xs ${c.caseCard}`}>
        {selectedCases.length ? (
          selectedCases.map((tc, i) => (
            <div key={i} className="mb-3 last:mb-0">
              {isSqlProblem ? (
                <>
                  {Object.entries(tc.input as unknown as Record<string, unknown[]>).map(([table, rows]) => (
                    <div key={table} className="mb-2">
                      <p className={`mb-0.5 text-[10px] font-bold uppercase tracking-widest ${c.muted}`}>{table}</p>
                      <p className={`font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>{JSON.stringify(rows)}</p>
                    </div>
                  ))}
                  <p className={`mb-0.5 text-[10px] font-bold uppercase tracking-widest ${c.muted}`}>Expected</p>
                  <p className={`font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>{JSON.stringify(tc.expected)}</p>
                </>
              ) : (
                <>
                  <p className={`mb-0.5 text-[10px] font-bold uppercase tracking-widest ${c.muted}`}>Input</p>
                  <p className={`font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>{formatInput(tc)}</p>
                  <p className={`mb-0.5 mt-2 text-[10px] font-bold uppercase tracking-widest ${c.muted}`}>Expected</p>
                  <p className={`font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>{JSON.stringify(tc.expected)}</p>
                </>
              )}
            </div>
          ))
        ) : (
          <p className={c.muted}>{judgeUnavailableMessage}</p>
        )}
      </div>

      {/* Custom case - hidden for special problems */}
      {!isSpecialProblem && (
        <div className={`grid gap-2 rounded-lg border p-3 ${c.customBorder}`}>
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${c.muted}`}>Custom testcase</p>
            <span className={`text-[11px] ${c.muted}`}>{customCases.length}/5</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <textarea
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              rows={2}
              placeholder="Input JSON: [[2,7,11,15],9]"
              className={`resize-none rounded-md border p-2 font-mono text-xs outline-none focus:border-sky-400 ${c.textarea}`}
            />
            <textarea
              value={customExpected}
              onChange={(e) => onCustomExpectedChange(e.target.value)}
              rows={2}
              placeholder="Expected JSON: [0,1]"
              className={`resize-none rounded-md border p-2 font-mono text-xs outline-none focus:border-sky-400 ${c.textarea}`}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-rose-500">{customCaseError}</p>
            <button
              type="button"
              onClick={onAddCustomCase}
              className={`inline-flex h-7 items-center gap-1 rounded-md px-3 text-xs font-bold transition ${
                isDark ? "bg-sky-700 text-white hover:bg-sky-600" : "bg-slate-900 text-white hover:bg-slate-700"
              }`}
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          {customCases.map((tc, i) => (
            <div key={i} className={`flex items-start justify-between gap-2 rounded-md p-2 ${isDark ? "bg-[#0f172a]" : "bg-slate-50"}`}>
              <div className={`min-w-0 font-mono text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                <p className="break-words">In: {formatInput(tc)}</p>
                <p className="break-words">Ex: {formatUnknown(tc.expected)}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveCustomCase(i)}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded transition ${c.muted} hover:text-rose-500`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
