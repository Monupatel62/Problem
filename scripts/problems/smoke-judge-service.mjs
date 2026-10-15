const DEFAULT_URL = "http://localhost:8787";

const serviceUrl = normalizeUrl(process.argv[2] || process.env.JUDGE_SERVICE_URL || DEFAULT_URL);
const token = process.env.JUDGE_SERVICE_TOKEN || "";

const tests = [
  {
    language: "JavaScript",
    functionName: "twoSum",
    code: "function twoSum(nums, target) { return [0, 1]; }",
  },
  {
    language: "Python",
    functionName: "twoSum",
    code: "def twoSum(nums, target):\n    return [0, 1]",
  },
  {
    language: "C++",
    functionName: "twoSum",
    code: [
      "class Solution {",
      "public:",
      "  vector<int> twoSum(vector<int>& nums, int target) {",
      "    return vector<int>{0, 1};",
      "  }",
      "};",
    ].join("\n"),
  },
  {
    language: "Java",
    functionName: "twoSum",
    code: [
      "class Solution {",
      "  public int[] twoSum(int[] nums, int target) {",
      "    return new int[]{0, 1};",
      "  }",
      "}",
    ].join("\n"),
  },
];

function normalizeUrl(value) {
  return value.replace(/\/+$/, "");
}

async function request(path, init = {}) {
  const response = await fetch(`${serviceUrl}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(Number(process.env.JUDGE_SERVICE_TIMEOUT_MS || 30_000)),
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function smokeLanguage(test) {
  const payload = await request("/judge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: test.language,
      functionName: test.functionName,
      code: test.code,
      cases: [{ input: [[2, 7, 11, 15], 9], expected: [0, 1] }],
    }),
  });

  const hasVisibleOutput = Array.isArray(payload.testResults) && payload.testResults[0]?.actual !== undefined;
  if (payload.status !== "Accepted" || payload.passed !== 1 || !hasVisibleOutput) {
    throw new Error(`${test.language} failed smoke: ${JSON.stringify(payload)}`);
  }

  return payload;
}

console.log(`[judge-smoke] Checking ${serviceUrl}`);

const health = await request("/health");
if (health.ok !== true) {
  throw new Error(`/health returned unexpected payload: ${JSON.stringify(health)}`);
}
console.log("[judge-smoke] health OK");

for (const test of tests) {
  const result = await smokeLanguage(test);
  console.log(`[judge-smoke] ${test.language} OK (${result.runtimeMs} ms)`);
}

console.log("[judge-smoke] all languages OK");
