"use client";

import { BookOpen, Code2, Gauge, Lightbulb } from "lucide-react";
import { ProblemDescription, ProblemEditorial, SubmissionsTab } from "@/components/problems/problem-description";
import type { ProblemDefinition } from "@/lib/problems/bank";
import type {
  ColorTokens,
  ProblemPanel,
  SubmissionAnalytics,
  SubmissionDetail,
  SubmissionSummary,
} from "./practice-types";

type ProblemLeftPanelProps = {
  problem: ProblemDefinition;
  isDark: boolean;
  c: ColorTokens;
  isJudgeReady: boolean;
  activeProblemPanel: ProblemPanel;
  submissions: SubmissionSummary[];
  submissionAnalytics: SubmissionAnalytics;
  submissionSource: "database" | "local";
  selectedSubmission: SubmissionDetail | null;
  isSubmissionDetailLoading: boolean;
  selectedSubmissionMessage: string;
  onChangePanel: (panel: ProblemPanel) => void;
  onSelectSubmission: (s: SubmissionSummary) => void;
};

export function ProblemLeftPanel({
  problem,
  isDark,
  c,
  isJudgeReady,
  activeProblemPanel,
  submissions,
  submissionAnalytics,
  submissionSource,
  selectedSubmission,
  isSubmissionDetailLoading,
  selectedSubmissionMessage,
  onChangePanel,
  onSelectSubmission,
}: ProblemLeftPanelProps) {
  return (
    <section
      id="problem-panel"
      className={`scroll-mt-24 flex min-h-[55vh] flex-col overflow-hidden rounded-xl border shadow-sm lg:h-full lg:min-h-0 ${c.panel}`}
    >
      {/* Tab bar */}
      <div className={`flex h-11 shrink-0 items-center gap-1 border-b px-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${c.panelTab}`}>
        {(["Description", "Editorial", "Solutions", "Submissions"] as ProblemPanel[]).map((tab) => {
          const icons: Record<ProblemPanel, React.ReactNode> = {
            Description: <BookOpen className="h-3.5 w-3.5" />,
            Editorial: <Lightbulb className="h-3.5 w-3.5 text-amber-400" />,
            Solutions: <Code2 className="h-3.5 w-3.5 text-emerald-500" />,
            Submissions: <Gauge className="h-3.5 w-3.5 text-blue-400" />,
          };
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChangePanel(tab)}
              className={`inline-flex h-full shrink-0 items-center gap-1.5 border-b-2 px-3 text-xs font-semibold transition ${
                activeProblemPanel === tab ? c.tabActive : c.tabInactive
              }`}
            >
              {icons[tab]}
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeProblemPanel === "Description" && (
          <ProblemDescription problem={problem} dark={isDark} isJudgeReady={isJudgeReady} />
        )}
        {activeProblemPanel === "Editorial" && (
          <ProblemEditorial problem={problem} dark={isDark} />
        )}
        {activeProblemPanel === "Solutions" && (
          <div className="px-5 py-8 text-center">
            <Code2 className={`mx-auto mb-3 h-8 w-8 ${c.muted}`} />
            <p className={`text-sm font-semibold ${c.sub}`}>Community solutions coming soon.</p>
            <p className={`mt-1 text-xs ${c.muted}`}>Submit your accepted solution to be first!</p>
          </div>
        )}
        {activeProblemPanel === "Submissions" && (
          <SubmissionsTab
            submissions={submissions}
            analytics={submissionAnalytics}
            source={submissionSource}
            selectedSubmission={selectedSubmission}
            isLoadingDetail={isSubmissionDetailLoading}
            detailMessage={selectedSubmissionMessage}
            dark={isDark}
            onSelectSubmission={onSelectSubmission}
          />
        )}
      </div>
    </section>
  );
}
