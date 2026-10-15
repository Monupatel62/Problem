const PLACEHOLDER_HOSTS = new Set(["your-judge-service-url", "your-judge-service.example.com", "your-judge-domain.example.com"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

export type JudgeServiceConfig = {
  enabled: boolean;
  url: string;
  reason?: string;
};

export function getJudgeServiceConfig(): JudgeServiceConfig {
  const rawUrl = process.env.JUDGE_SERVICE_URL?.trim() || "";
  if (!rawUrl) return { enabled: false, url: "", reason: "JUDGE_SERVICE_URL is not set." };

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { enabled: false, url: rawUrl, reason: "JUDGE_SERVICE_URL is not a valid URL." };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { enabled: false, url: rawUrl, reason: "JUDGE_SERVICE_URL must start with http:// or https://." };
  }

  if (PLACEHOLDER_HOSTS.has(parsed.hostname) || parsed.hostname.includes("your-judge")) {
    return { enabled: false, url: rawUrl, reason: "JUDGE_SERVICE_URL is still a placeholder." };
  }

  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    return { enabled: false, url: rawUrl, reason: "Production judge service must use https://." };
  }

  if (process.env.NODE_ENV === "production" && LOCAL_HOSTS.has(parsed.hostname)) {
    return { enabled: false, url: rawUrl, reason: "Production judge service cannot point to localhost." };
  }

  if (process.env.NODE_ENV === "production" && !process.env.JUDGE_SERVICE_TOKEN?.trim()) {
    return { enabled: false, url: rawUrl, reason: "JUDGE_SERVICE_TOKEN is required in production." };
  }

  return { enabled: true, url: parsed.toString().replace(/\/$/, "") };
}
