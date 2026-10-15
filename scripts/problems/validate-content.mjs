import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { loadStructuredProblems } from "./load-structured-problems.mjs";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content", "problems");
const REQUIRED_FILES = ["problem.mdx", "metadata.json", "hints.json", "editorial.mdx", "testcases.json"];
const REQUIRED_STARTERS = ["javascript.js", "python.py", "cpp.cpp", "java.java"];
const VALID_DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);
const VALID_TRACKS = new Set(["Algorithms", "Database", "Shell", "Concurrency"]);

function findProblemDirs() {
  if (!existsSync(CONTENT_ROOT)) return [];

  return readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((topic) => {
      const topicDir = path.join(CONTENT_ROOT, topic.name);
      return readdirSync(topicDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({ topic: topic.name, dir: path.join(topicDir, entry.name) }));
    });
}

function addError(errors, scope, message) {
  errors.push(`${scope}: ${message}`);
}

function validateProblemShape(problem, errors) {
  const scope = problem.slug || problem.title || `problem ${problem.id ?? "unknown"}`;

  if (!Number.isInteger(problem.id) || problem.id <= 0) addError(errors, scope, "id must be a positive integer");
  if (!problem.slug || typeof problem.slug !== "string") addError(errors, scope, "slug is required");
  if (!problem.title || typeof problem.title !== "string") addError(errors, scope, "title is required");
  if (!VALID_DIFFICULTIES.has(problem.difficulty)) addError(errors, scope, `invalid difficulty ${problem.difficulty}`);
  if (!VALID_TRACKS.has(problem.track)) addError(errors, scope, `invalid track ${problem.track}`);
  if (!Array.isArray(problem.tags) || problem.tags.length === 0) addError(errors, scope, "at least one tag is required");
  if (!problem.description?.trim()) addError(errors, scope, "problem.mdx must not be empty");
  if (!Array.isArray(problem.constraints)) addError(errors, scope, "constraints must be an array");
  if (!Array.isArray(problem.hints)) addError(errors, scope, "hints must be an array");
  if (!Array.isArray(problem.examples) || problem.examples.length === 0) addError(errors, scope, "at least one example is required");
  if (!problem.functionName || typeof problem.functionName !== "string") addError(errors, scope, "functionName is required");

  for (const language of ["JavaScript", "Python", "C++", "Java"]) {
    if (!problem.starterCode?.[language]?.trim()) addError(errors, scope, `missing ${language} starter code`);
  }

  const executableTracks = new Set(["Algorithms"]);
  if (problem.judgeReady !== false && executableTracks.has(problem.track) && problem.sampleCases.length === 0) {
    addError(errors, scope, "algorithm problems need at least one sample test case");
  }
}

const errors = [];
const seenIds = new Map();
const seenSlugs = new Map();
const problemDirs = findProblemDirs();

for (const { topic, dir } of problemDirs) {
  const scope = path.relative(process.cwd(), dir);
  for (const fileName of REQUIRED_FILES) {
    if (!existsSync(path.join(dir, fileName))) addError(errors, scope, `missing ${fileName}`);
  }
  for (const fileName of REQUIRED_STARTERS) {
    if (!existsSync(path.join(dir, "starter-code", fileName))) {
      addError(errors, scope, `missing starter-code/${fileName}`);
    }
  }
  if (!topic.trim()) addError(errors, scope, "topic folder name is empty");
}

const problems = loadStructuredProblems();
for (const problem of problems) {
  validateProblemShape(problem, errors);

  if (seenIds.has(problem.id)) {
    addError(errors, problem.slug, `duplicate id ${problem.id}; already used by ${seenIds.get(problem.id)}`);
  }
  seenIds.set(problem.id, problem.slug);

  if (seenSlugs.has(problem.slug)) {
    addError(errors, problem.slug, `duplicate slug; already used in ${seenSlugs.get(problem.slug)}`);
  }
  seenSlugs.set(problem.slug, problem.id);
}

if (problems.length !== problemDirs.length) {
  addError(errors, "content", `loaded ${problems.length} problems from ${problemDirs.length} folders`);
}

if (errors.length > 0) {
  console.error("[validate-problems] failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[validate-problems] ok: ${problems.length} structured problems`);
