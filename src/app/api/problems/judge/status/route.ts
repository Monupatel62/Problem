import { NextResponse } from "next/server";
import { getJudgeServiceConfig } from "@/lib/problems/judge-service-config";

export const runtime = "nodejs";

export async function GET() {
  const dockerEnabled = process.env.JUDGE_DOCKER_ENABLED === "true";
  const judge0FallbackEnabled = process.env.JUDGE0_FALLBACK_DISABLED !== "true";
  const externalServiceConfig = getJudgeServiceConfig();
  const externalServiceEnabled = externalServiceConfig.enabled;
  const externalServiceConfigured = Boolean(externalServiceConfig.url);
  const cloudFallbackEnabled = !externalServiceEnabled && !dockerEnabled && judge0FallbackEnabled;
  const multiLanguageStatus = externalServiceEnabled || cloudFallbackEnabled ? "external-service" : dockerEnabled ? "enabled" : "docker-disabled";
  const needsMessage = externalServiceConfigured && !externalServiceEnabled ? externalServiceConfig.reason : undefined;
  const safetyLimits = {
    maxCodeLength: Number(process.env.JUDGE_MAX_CODE_LENGTH || 50_000),
    maxCases: Number(process.env.JUDGE_MAX_CASES || 30),
    timeoutMs: Number(process.env.JUDGE_SERVICE_TIMEOUT_MS || 10_000),
    dockerTimeoutMs: Number(process.env.JUDGE_DOCKER_TIMEOUT_MS || 15_000),
  };

  return NextResponse.json({
    runner: externalServiceEnabled ? "external-service" : cloudFallbackEnabled ? "judge0" : "server",
    dockerEnabled,
    judge0FallbackEnabled,
    externalServiceEnabled,
    externalServiceConfigured,
    externalServiceMessage: externalServiceConfig.reason,
    safetyLimits,
    languages: {
      JavaScript: {
        status: externalServiceEnabled ? "external-service" : "enabled",
        label: externalServiceEnabled ? "External judge" : "Live",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : "Runs on the built-in WoHoTech JavaScript judge.",
      },
      TypeScript: {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Compiles and runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Compiles and runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "TypeScript execution needs Docker or an external judge service.",
      },
      Python: {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "Python execution needs Docker or an external judge service.",
      },
      "C++": {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Compiles and runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Compiles and runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "C++ execution needs Docker or an external judge service.",
      },
      C: {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Compiles and runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Compiles and runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "C execution needs Docker or an external judge service.",
      },
      Java: {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Compiles and runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Compiles and runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "Java execution needs Docker or an external judge service.",
      },
      Go: {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Compiles and runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Compiles and runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "Go execution needs Docker or an external judge service.",
      },
      Rust: {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Compiles and runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Compiles and runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "Rust execution needs Docker or an external judge service.",
      },
      Kotlin: {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Compiles and runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Compiles and runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "Kotlin execution needs Docker or an external judge service.",
      },
      Ruby: {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "Ruby execution needs Docker or an external judge service.",
      },
      PHP: {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "PHP execution needs Docker or an external judge service.",
      },
      "C#": {
        status: multiLanguageStatus,
        label: externalServiceEnabled ? "External judge" : dockerEnabled ? "Docker live" : cloudFallbackEnabled ? "Cloud judge" : "Needs Docker",
        message: externalServiceEnabled
          ? "Runs through the configured external judge service."
          : dockerEnabled
            ? "Compiles and runs in an isolated Docker container."
            : cloudFallbackEnabled
              ? "Compiles and runs through the Judge0 cloud fallback when Docker is not available."
            : needsMessage || "C# execution needs Docker or an external judge service.",
      },
      SQL: {
        status: "external-service",
        label: "External judge",
        message: "SQL runs through the external judge.",
      },
      Bash: {
        status: "external-service",
        label: "External judge",
        message: "Shell runs through the external judge.",
      },
    },
  });
}
