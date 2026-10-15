import test from "node:test";
import assert from "node:assert/strict";
import { loadStructuredProblems } from "../scripts/problems/load-structured-problems.mjs";

test("structured content loads a complete problem catalogue", () => {
  const problems = loadStructuredProblems();
  assert.ok(problems.length >= 70, `Expected at least 70 structured problems, found ${problems.length}`);
  const slugs = problems.map((problem) => problem.slug);
  const ids = problems.map((problem) => problem.id);
  assert.equal(new Set(slugs).size, slugs.length, "problem slugs must be unique");
  assert.equal(new Set(ids).size, ids.length, "problem ids must be unique");
  for (const problem of problems) {
    assert.ok(problem.title, `missing title for ${problem.slug}`);
    assert.ok(problem.description, `missing statement for ${problem.slug}`);
    assert.ok(Array.isArray(problem.sampleCases), `sample cases must be an array for ${problem.slug}`);
    assert.ok(Array.isArray(problem.hiddenCases), `hidden cases must be an array for ${problem.slug}`);
    assert.ok(problem.starterCode && typeof problem.starterCode === "object", `starter code missing for ${problem.slug}`);
  }
});
