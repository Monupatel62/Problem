import { loadStructuredProblems } from "./load-structured-problems.mjs";

const serviceUrl = (process.env.JUDGE_SERVICE_URL || "http://localhost:8787").replace(/\/+$/, "");
const token = process.env.JUDGE_SERVICE_TOKEN || "";
const languages = ["JavaScript", "Python", "C++", "Java"];

async function request(problem, language) {
  const response = await fetch(`${serviceUrl}/judge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      language,
      code: problem.starterCode[language],
      functionName: problem.functionName,
      cases: problem.sampleCases,
    }),
    signal: AbortSignal.timeout(Number(process.env.JUDGE_SERVICE_TIMEOUT_MS || 30_000)),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status !== "Accepted") {
    throw new Error(`${problem.slug} ${language}: ${response.status} ${JSON.stringify(payload)}`);
  }
}

const runnableProblems = loadStructuredProblems().filter((problem) => problem.track === "Algorithms" && problem.judgeReady !== false && problem.sampleCases.length > 0);
console.log(`[bank-smoke] ${runnableProblems.length} runnable problems x ${languages.length} languages`);

for (const problem of runnableProblems) {
  for (const language of languages) {
    await request(problem, language);
  }
  console.log(`[bank-smoke] ${problem.slug} OK`);
}

console.log("[bank-smoke] all runnable starter code OK");
