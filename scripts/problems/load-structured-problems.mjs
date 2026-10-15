import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content", "problems");

const starterFiles = [
  ["JavaScript", "javascript.js"],
  ["Python", "python.py"],
  ["C++", "cpp.cpp"],
  ["Java", "java.java"],
];

function readText(filePath) {
  return readFileSync(filePath, "utf8").trim();
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function readParagraphs(filePath) {
  if (!existsSync(filePath)) return [];
  return readText(filePath)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
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

function readStarterCode(problemDir) {
  const starterDir = path.join(problemDir, "starter-code");
  const starterCode = {};

  for (const [language, fileName] of starterFiles) {
    const filePath = path.join(starterDir, fileName);
    if (existsSync(filePath)) {
      starterCode[language] = readText(filePath);
    }
  }

  return starterCode;
}

function loadProblemDir(problemDir) {
  const metadataPath = path.join(problemDir, "metadata.json");
  const problemPath = path.join(problemDir, "problem.mdx");
  const testcasesPath = path.join(problemDir, "testcases.json");

  if (!existsSync(metadataPath) || !existsSync(problemPath) || !existsSync(testcasesPath)) {
    return null;
  }

  const metadata = readJson(metadataPath);
  const testcases = readJson(testcasesPath);
  const hintsPath = path.join(problemDir, "hints.json");

  return {
    ...metadata,
    description: readText(problemPath),
    hints: existsSync(hintsPath) ? readJson(hintsPath) : [],
    sampleCases: testcases.sampleCases || [],
    hiddenCases: testcases.hiddenCases || [],
    // SQL setup DDL statements (optional)
    ...(testcases.sqlSetup ? { sqlSetup: testcases.sqlSetup } : {}),
    starterCode: readStarterCode(problemDir),
    editorial: readParagraphs(path.join(problemDir, "editorial.mdx")),
  };
}

export function loadStructuredProblems() {
  return findProblemDirs()
    .map(loadProblemDir)
    .filter(Boolean)
    .sort((first, second) => first.id - second.id);
}
