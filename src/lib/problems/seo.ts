import type { ProblemDefinition } from "@/lib/problems/bank";

/**
 * Search eligibility is deliberately stricter than judge availability.
 * A runnable exercise with a one-line prompt is useful inside the product,
 * but is not yet a complete standalone learning resource for Google.
 */
export function isIndexableProblem(problem: ProblemDefinition) {
  const descriptionWords = problem.description.trim().split(/\s+/).filter(Boolean).length;
  const editorialWords = (problem.editorial ?? []).join(" ").trim().split(/\s+/).filter(Boolean).length;
  const starterLanguages = Object.values(problem.starterCode).filter((code) => code?.trim()).length;
  // Database exercises expose a single SQL editor; requiring four language stubs
  // would measure an unavailable UI option instead of runnable learning quality.
  const requiredStarterLanguages = problem.isSql ? 1 : 4;

  return (
    problem.judgeReady === true &&
    descriptionWords >= 250 &&
    editorialWords >= 300 &&
    problem.examples.length >= 2 &&
    problem.constraints.length >= 3 &&
    problem.hints.length >= 2 &&
    problem.sampleCases.length >= 2 &&
    problem.hiddenCases.length >= 3 &&
    starterLanguages >= requiredStarterLanguages &&
    (problem.solutionApproaches?.length ?? 0) >= 1
  );
}
