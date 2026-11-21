"use client";

import type { ProblemDefinition } from "@/lib/problems/bank";
import { ProblemDescriptionTab } from "./problem-description-tab";
import { ProblemEditorialTab } from "./problem-editorial-tab";
import {
  ProblemSubmissionsTab,
  type SubmissionSummary,
  type SubmissionDetail,
  type SubmissionAnalytics,
} from "./problem-submissions-tab";

// ─── Re-export types for backward compatibility ──────────────────────────────
export type { SubmissionSummary, SubmissionDetail, SubmissionAnalytics };

// ─── Re-export sub-components with original names ────────────────────────────
// These match the import names used in problem-practice-workspace.tsx

export function ProblemDescription({
  problem,
  dark = false,
  isJudgeReady = true,
}: {
  problem: ProblemDefinition;
  dark?: boolean;
  isJudgeReady?: boolean;
}) {
  return <ProblemDescriptionTab problem={problem} dark={dark} isJudgeReady={isJudgeReady} />;
}

export function ProblemEditorial({
  problem,
  dark = false,
}: {
  problem: ProblemDefinition;
  dark?: boolean;
}) {
  return <ProblemEditorialTab problem={problem} dark={dark} />;
}

export function SubmissionsTab({
  submissions,
  analytics,
  source,
  selectedSubmission,
  isLoadingDetail,
  detailMessage,
  dark = false,
  onSelectSubmission,
}: {
  submissions: SubmissionSummary[];
  analytics: SubmissionAnalytics;
  source: "database" | "local";
  selectedSubmission: SubmissionDetail | null;
  isLoadingDetail: boolean;
  detailMessage: string;
  dark?: boolean;
  onSelectSubmission: (s: SubmissionSummary) => void;
}) {
  return (
    <ProblemSubmissionsTab
      submissions={submissions}
      analytics={analytics}
      source={source}
      selectedSubmission={selectedSubmission}
      isLoadingDetail={isLoadingDetail}
      detailMessage={detailMessage}
      dark={dark}
      onSelectSubmission={onSelectSubmission}
    />
  );
}
