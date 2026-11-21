import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ProblemDefinition } from "@/lib/problems/bank";

type ProblemMetadata = Omit<
  ProblemDefinition,
  "description" | "hints" | "sampleCases" | "hiddenCases" | "starterCode" | "editorial"
>;

type TestCaseFile = Pick<ProblemDefinition, "sampleCases" | "hiddenCases">;

const CONTENT_ROOT = path.join(process.cwd(), "src", "content", "problems");
const STARTER_FILES: Array<[keyof ProblemDefinition["starterCode"], string]> = [
  ["JavaScript", "javascript.js"],
  ["Python", "python.py"],
  ["C++", "cpp.cpp"],
  ["Java", "java.java"],
];

let cachedStructuredProblems: ProblemDefinition[] | null = null;

function readText(filePath: string) {
  return readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").trim();
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readText(filePath)) as T;
}

function readParagraphs(filePath: string) {
  if (!existsSync(filePath)) return [];
  return readText(filePath)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function readStarterCode(problemDir: string) {
  const starterDir = path.join(problemDir, "starter-code");
  const starterCode: ProblemDefinition["starterCode"] = {};

  for (const [language, fileName] of STARTER_FILES) {
    const filePath = path.join(starterDir, fileName);
    if (existsSync(filePath)) {
      starterCode[language] = readText(filePath);
    }
  }

  return starterCode;
}

function loadProblemDir(problemDir: string): ProblemDefinition | null {
  const metadataPath = path.join(problemDir, "metadata.json");
  const problemPath = path.join(problemDir, "problem.mdx");
  const hintsPath = path.join(problemDir, "hints.json");
  const testcasesPath = path.join(problemDir, "testcases.json");

  if (!existsSync(metadataPath) || !existsSync(problemPath) || !existsSync(testcasesPath)) {
    return null;
  }

  const metadata = readJson<ProblemMetadata>(metadataPath);
  const testcases = readJson<TestCaseFile>(testcasesPath);
  const hints = existsSync(hintsPath) ? readJson<string[]>(hintsPath) : [];

  return {
    ...metadata,
    description: readText(problemPath),
    hints,
    sampleCases: testcases.sampleCases ?? [],
    hiddenCases: testcases.hiddenCases ?? [],
    starterCode: readStarterCode(problemDir),
    editorial: readParagraphs(path.join(problemDir, "editorial.mdx")),
  };
}

function findProblemDirs() {
  if (!existsSync(CONTENT_ROOT)) return [];

  return readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((topic) => {
      const topicDir = path.join(CONTENT_ROOT, topic.name);
      return readdirSync(topicDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(topicDir, entry.name));
    });
}

export function loadStructuredProblemContent() {
  if (cachedStructuredProblems) return cachedStructuredProblems;

  cachedStructuredProblems = findProblemDirs()
    .map(loadProblemDir)
    .filter((problem): problem is ProblemDefinition => Boolean(problem))
    .sort((first, second) => first.id - second.id);

  return cachedStructuredProblems;
}

export function mergeStructuredProblems(fallbackProblems: ProblemDefinition[]) {
  const structuredProblems = loadStructuredProblemContent();
  if (structuredProblems.length === 0) return fallbackProblems;

  const structuredBySlug = new Map(structuredProblems.map((problem) => [problem.slug, problem]));
  const merged = fallbackProblems.map((problem) => structuredBySlug.get(problem.slug) ?? problem);
  const fallbackSlugs = new Set(fallbackProblems.map((problem) => problem.slug));
  const newStructuredProblems = structuredProblems.filter((problem) => !fallbackSlugs.has(problem.slug));

  return [...merged, ...newStructuredProblems].sort((first, second) => first.id - second.id);
}
