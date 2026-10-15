"use client";

import { useEffect, useMemo, useState } from "react";
import { ResizablePanel } from "@/components/problems/resizable-panel";
import { PracticeHeader, MobileActionBar } from "@/components/problems/practice-header";
import { ProblemLeftPanel } from "@/components/problems/problem-left-panel";
import { CodeEditorPanel } from "@/components/problems/code-editor-panel";
import { TestResultsPanel } from "@/components/problems/test-results-panel";
import { AcceptedFlashOverlay } from "@/components/problems/accepted-flash";
import { generateStub } from "@/lib/problems/stub-generator";
import type { ProblemCase, ProblemDefinition } from "@/lib/problems/bank";
import {
  type BottomPanel,
  type ColorTokens,
  type JudgeResult,
  type LanguageName,
  type LanguageStatus,
  type ProblemPanel,
  type SubmissionAnalytics,
  type SubmissionDetail,
  type SubmissionSummary,
  buildLocalAnalytics,
  darkTokens,
  defaultLanguageStatuses,
  emptyAnalytics,
  languages,
  lightTokens,
  readJson,
  todayKey,
} from "@/components/problems/practice-types";

// ─── Main Orchestrator ────────────────────────────────────────────────────────
export function ProblemPracticeWorkspace({ problem }: { problem: ProblemDefinition }) {
  const isJudgeReady = problem.judgeReady !== false && problem.sampleCases.length > 0;
  const isSqlProblem = problem.track === "Database";
  const isShellProblem = problem.track === "Shell";
  const isConcurrencyProblem = problem.track === "Concurrency";
  const isSpecialProblem = isSqlProblem || isShellProblem || isConcurrencyProblem;

  const judgeUnavailableMessage =
    "The judge runner for this problem is not enabled yet. You can read and plan your solution, but Run and Submit are disabled for now.";

  // Hydration guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Core state
  const [language, setLanguage] = useState<LanguageName>("JavaScript");
  const [code, setCode] = useState("");
  const [savedAt, setSavedAt] = useState("Blank editor");
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [isJudging, setIsJudging] = useState(false);
  const [showAccepted, setShowAccepted] = useState(false);

  // Proactively warm up the judge service on mount (prevents Render cold-start delay)
  useEffect(() => {
    if (!isJudgeReady) return;
    // Warm up in background — fire and forget
    fetch("/api/problems/judge/warmup", { method: "POST" }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Panels
  const [activeProblemPanel, setActiveProblemPanel] = useState<ProblemPanel>("Description");
  const [activeBottomPanel, setActiveBottomPanel] = useState<BottomPanel>("Test Result");

  // Test cases
  const [selectedSampleCases, setSelectedSampleCases] = useState(
    () => problem.sampleCases.map((_, i) => i),
  );
  const [customCases, setCustomCases] = useState<ProblemCase[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [customExpected, setCustomExpected] = useState("");
  const [customCaseError, setCustomCaseError] = useState("");

  // Language runner statuses
  const [languageStatuses, setLanguageStatuses] = useState<Record<LanguageName, LanguageStatus>>(defaultLanguageStatuses);

  // Submissions
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [submissionAnalytics, setSubmissionAnalytics] = useState<SubmissionAnalytics>(emptyAnalytics);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
  const [selectedSubmissionMessage, setSelectedSubmissionMessage] = useState("");
  const [isSubmissionDetailLoading, setIsSubmissionDetailLoading] = useState(false);
  const [submissionSource, setSubmissionSource] = useState<"database" | "local">("local");

  // Theme
  const [workspaceTheme, setWorkspaceTheme] = useState<"light" | "dark-blue">("light");
  useEffect(() => {
    const saved = window.localStorage.getItem("wohotech-workspace-theme");
    setWorkspaceTheme(saved === "dark-blue" ? "dark-blue" : "light");
  }, []);

  // Result state
  const [result, setResult] = useState<JudgeResult>({
    status: "Idle", passed: 0, total: problem.sampleCases.length,
    runtimeMs: 0, memoryMb: 0,
    message: isJudgeReady ? "Type your code and run it to see real output." : judgeUnavailableMessage,
  });

  // Derived
  const isDark = workspaceTheme === "dark-blue";
  const c: ColorTokens = isDark ? darkTokens : lightTokens;

  const activeCases = useMemo(
    () => result.total === problem.sampleCases.length
      ? problem.sampleCases
      : [...problem.sampleCases, ...problem.hiddenCases],
    [problem, result.total],
  );

  const selectedCases = useMemo(() => {
    const cases = selectedSampleCases.map((i) => problem.sampleCases[i]).filter(Boolean);
    return [...(cases.length > 0 ? cases : problem.sampleCases), ...customCases];
  }, [customCases, problem.sampleCases, selectedSampleCases]);

  const currentLanguageStatus = languageStatuses[language] ?? defaultLanguageStatuses[language];
  const isLanguageExecutable = isSpecialProblem
    || currentLanguageStatus.status === "enabled"
    || currentLanguageStatus.status === "external-service";
  const canJudge = isJudgeReady && isLanguageExecutable;
  const hasResult = result.status !== "Idle" || isJudging || Boolean(result.testResults?.length || result.failedCase);

  // ── Load / auto-save code ─────────────────────────────────────────────────
  useEffect(() => {
    const saved = window.localStorage.getItem(`wohotech-code:${problem.slug}:${language}`);
    if (saved) { setCode(saved); setSavedAt("Saved"); }
    else {
      const stub = generateStub(problem.starterCode?.[language] || "", language, problem.functionName);
      setCode(stub); setSavedAt("Blank editor");
    }
  }, [problem.slug, language, problem.starterCode, problem.functionName]);

  useEffect(() => {
    if (!code.trim()) return;
    const t = setTimeout(() => {
      window.localStorage.setItem(`wohotech-code:${problem.slug}:${language}`, code);
      setSavedAt(`Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    }, 1000);
    return () => clearTimeout(t);
  }, [code, problem.slug, language]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        if (canJudge && !isJudging) handleSubmit();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (canJudge && !isJudging) handleRun();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // ── Judge status ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    void fetch("/api/problems/judge/status")
      .then((r) => r.json())
      .then((p) => {
        if (cancelled || !p?.languages) return;
        setLanguageStatuses({ ...defaultLanguageStatuses, ...(p.languages as Partial<Record<LanguageName, LanguageStatus>>) });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // ── Submissions ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/problems/${problem.slug}/submissions`)
      .then((r) => r.json())
      .then((p) => {
        if (cancelled) return;
        const nextSubs = Array.isArray(p.submissions) ? p.submissions : [];
        setSubmissions(nextSubs);
        setSubmissionAnalytics(p.analytics ?? buildLocalAnalytics(nextSubs));
        setSubmissionSource(p.source === "database" ? "database" : "local");
        if (typeof p.reason === "string") setSelectedSubmissionMessage(p.reason);
      })
      .catch(() => { if (!cancelled) setSubmissionSource("local"); });
    return () => { cancelled = true; };
  }, [problem.slug]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function toggleTheme() {
    const next = workspaceTheme === "light" ? "dark-blue" : "light";
    setWorkspaceTheme(next);
    window.localStorage.setItem("wohotech-workspace-theme", next);
  }

  function changeLanguage(lang: LanguageName) {
    setLanguage(lang);
    const saved = window.localStorage.getItem(`wohotech-code:${problem.slug}:${lang}`);
    if (saved) { setCode(saved); setSavedAt("Saved"); }
    else {
      const stub = generateStub(problem.starterCode?.[lang] || "", lang, problem.functionName);
      setCode(stub); setSavedAt("Blank editor");
    }
    setResult({ status: "Idle", passed: 0, total: problem.sampleCases.length, runtimeMs: 0, memoryMb: 0,
      message: isJudgeReady ? "Type your code and run it to see real output." : judgeUnavailableMessage });
  }

  function saveCodeNow() {
    if (code.trim()) window.localStorage.setItem(`wohotech-code:${problem.slug}:${language}`, code);
    else window.localStorage.removeItem(`wohotech-code:${problem.slug}:${language}`);
    setSavedAt(`Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  }

  function resetCode() {
    const stub = generateStub(problem.starterCode?.[language] || "", language, problem.functionName);
    setCode(stub);
    window.localStorage.setItem(`wohotech-code:${problem.slug}:${language}`, stub);
    setSavedAt("Reset");
    setResult({ status: "Idle", passed: 0, total: problem.sampleCases.length, runtimeMs: 0, memoryMb: 0,
      message: isJudgeReady ? "Editor reset. Type your code and run it." : judgeUnavailableMessage });
    setActiveBottomPanel("Test Result");
  }

  function toggleSampleCase(i: number) {
    setSelectedSampleCases((cur) =>
      cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i].sort((a, b) => a - b),
    );
  }

  function addCustomCase() {
    setCustomCaseError("");
    if (customCases.length >= 5) { setCustomCaseError("Maximum 5 custom cases."); return; }
    try {
      const input = JSON.parse(customInput);
      const expected = JSON.parse(customExpected);
      if (!Array.isArray(input)) { setCustomCaseError("Input must be a JSON array, e.g. [[2,7,11,15],9]."); return; }
      setCustomCases((cur) => [...cur, { input, expected }]);
      setCustomInput(""); setCustomExpected("");
    } catch {
      setCustomCaseError("Invalid JSON. Input: [[2,7,11,15],9]  Expected: [0,1]");
    }
  }

  function removeCustomCase(i: number) {
    setCustomCases((cur) => cur.filter((_, idx) => idx !== i));
  }

  function loadSubmissionDetail(s: SubmissionSummary) {
    setSelectedSubmissionMessage("");
    if (submissionSource !== "database") {
      setSelectedSubmission({ ...s, code,
        problem: { slug: problem.slug, title: problem.title, difficulty: problem.difficulty, tags: problem.tags } });
      return;
    }
    setIsSubmissionDetailLoading(true);
    void fetch(`/api/problems/${problem.slug}/submissions/${s.id}`)
      .then((r) => r.json())
      .then((p) => {
        if (p.submission) { setSelectedSubmission(p.submission); setSelectedSubmissionMessage(""); }
        else { setSelectedSubmission(null); setSelectedSubmissionMessage(p.reason ?? "Submission detail unavailable."); }
      })
      .catch((e) => { setSelectedSubmission(null); setSelectedSubmissionMessage(e instanceof Error ? e.message : "Unavailable."); })
      .finally(() => setIsSubmissionDetailLoading(false));
  }

  // ── Judge ─────────────────────────────────────────────────────────────────
  function judge(cases: ProblemCase[], mode: "run" | "submit") {
    if (!isJudgeReady) {
      setActiveBottomPanel("Test Result");
      setResult({ status: "Idle", passed: 0, total: 0, runtimeMs: 0, memoryMb: 0, message: judgeUnavailableMessage });
      return;
    }
    if (!isLanguageExecutable) {
      setActiveBottomPanel("Test Result");
      setResult({ status: "Idle", passed: 0, total: 0, runtimeMs: 0, memoryMb: 0, message: currentLanguageStatus.message });
      return;
    }
    if (!code.trim()) {
      setActiveBottomPanel("Test Result");
      setResult({ status: "Idle", passed: 0, total: cases.length, runtimeMs: 0, memoryMb: 0,
        message: "Write your solution first." });
      return;
    }

    setIsJudging(true);
    setShowAccepted(false);
    setActiveBottomPanel("Test Result");

    if (typeof window !== "undefined") {
      const attempted = new Set(readJson<string[]>("wohotech-attempted-problems", []));
      attempted.add(problem.slug);
      window.localStorage.setItem("wohotech-attempted-problems", JSON.stringify([...attempted]));
      const practiceDays = new Set(readJson<string[]>("wohotech-practice-days", []));
      practiceDays.add(todayKey());
      window.localStorage.setItem("wohotech-practice-days", JSON.stringify([...practiceDays]));
    }

    void fetch(`/api/problems/${problem.slug}/judge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language, code, mode,
        isSql: problem.track === "Database",
        isShell: problem.track === "Shell",
        isConcurrency: problem.track === "Concurrency",
        sampleIndexes: mode === "run" ? selectedSampleCases : undefined,
        customCases: mode === "run" ? customCases : undefined,
      }),
    })
      .then((r) => r.json())
      .then((payload) => {
        const next: JudgeResult = {
          status: payload.status ?? "Runtime Error",
          passed: Number(payload.passed ?? 0),
          total: Number(payload.total ?? cases.length),
          runtimeMs: Number(payload.runtimeMs ?? 0),
          memoryMb: Number(payload.memoryMb ?? 0),
          message: String(payload.message ?? "Judge returned unexpected response."),
          failedCase: payload.failedCase
            ? { input: Array.isArray(payload.failedCase.input) ? payload.failedCase.input : [],
                expected: payload.failedCase.expected, actual: payload.failedCase.actual }
            : undefined,
          testResults: Array.isArray(payload.testResults)
            ? payload.testResults.map((item: any, idx: number) => ({
                caseNumber: Number(item.caseNumber ?? idx + 1),
                status: ["Accepted", "Wrong Answer", "Runtime Error"].includes(item.status)
                  ? item.status : "Runtime Error",
                input: Array.isArray(item.input) ? item.input : [],
                expected: item.expected, actual: item.actual,
                runtimeMs: Number(item.runtimeMs ?? 0),
                memoryMb: Number(item.memoryMb ?? 0),
                message: typeof item.message === "string" ? item.message : undefined,
              }))
            : undefined,
        };

        if (mode === "submit" && next.status === "Accepted" && typeof window !== "undefined") {
          const solved = new Set(readJson<string[]>("wohotech-solved-problems", []));
          solved.add(problem.slug);
          window.localStorage.setItem("wohotech-solved-problems", JSON.stringify([...solved]));
          const dailyCompletions = readJson<Record<string, string>>("wohotech-daily-completions", {});
          dailyCompletions[todayKey()] = problem.slug;
          window.localStorage.setItem("wohotech-daily-completions", JSON.stringify(dailyCompletions));
          setShowAccepted(true);
        }

        setResult({
          ...next,
          message: mode === "submit" && next.status === "Accepted"
            ? `Accepted! ${next.total} test cases passed.`
            : next.message,
        });

        const newSub = {
          id: payload.submissionId ?? `${Date.now()}`,
          language, status: next.status,
          passed: next.passed, total: next.total,
          runtimeMs: next.runtimeMs, memoryMb: next.memoryMb,
          message: next.message, createdAt: new Date().toISOString(),
        };

        if (payload.persisted) {
          setSubmissionSource("database");
          setSubmissions((cur) => { const s = [newSub, ...cur].slice(0, 20); setSubmissionAnalytics(buildLocalAnalytics(s)); return s; });
          setSelectedSubmission({ ...newSub, code, testResults: next.testResults,
            problem: { slug: problem.slug, title: problem.title, difficulty: problem.difficulty, tags: problem.tags } });
        } else if (mode === "submit") {
          setSubmissionSource("local");
          setSubmissions((cur) => { const s = [newSub, ...cur].slice(0, 20); setSubmissionAnalytics(buildLocalAnalytics(s)); return s; });
          setSelectedSubmission({ ...newSub, code, testResults: next.testResults,
            problem: { slug: problem.slug, title: problem.title, difficulty: problem.difficulty, tags: problem.tags } });
        }
        setIsJudging(false);
      })
      .catch((e) => {
        const isTimeout = e instanceof Error && (e.name === "AbortError" || e.message.includes("timeout") || e.message.includes("signal"));
        const isNetwork = e instanceof Error && (e.message.includes("fetch") || e.message.includes("network") || e.message.includes("Failed to fetch"));
        const message = isTimeout || isNetwork
          ? `The judge service is starting up (Render free tier cold start). Please wait 30–60 seconds and try again. Your code is saved.`
          : e instanceof Error ? e.message : "Judge service unavailable. Please try again.";
        setResult({ status: "Runtime Error", passed: 0, total: problem.sampleCases.length,
          runtimeMs: 0, memoryMb: 0, message });
        setIsJudging(false);
      });
  }

  // ── Convenience handlers ──────────────────────────────────────────────────
  function handleRun() { judge(selectedCases, "run"); }
  function handleSubmit() { judge([...problem.sampleCases, ...problem.hiddenCases], "submit"); }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center ${isDark ? "bg-[#0b1220]" : "bg-[#f5f5f5]"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-300 border-t-sky-500" />
          <p className="text-sm font-medium text-slate-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`fixed inset-0 z-[100] flex min-h-screen flex-col overflow-hidden transition-colors duration-200 ${c.root}`}>

      {/* Accepted celebration overlay */}
      <AcceptedFlashOverlay
        show={showAccepted}
        runtimeMs={result.runtimeMs}
        memoryMb={result.memoryMb}
        onDismiss={() => setShowAccepted(false)}
      />

      {/* Header */}
      <PracticeHeader
        problem={problem}
        isDark={isDark}
        c={c}
        isJudging={isJudging}
        canJudge={canJudge}
        isEditorMaximized={isEditorMaximized}
        isSpecialProblem={isSpecialProblem}
        onRun={handleRun}
        onSubmit={handleSubmit}
        onToggleTheme={toggleTheme}
        onToggleMaximize={() => setIsEditorMaximized((v) => !v)}
      />

      {/* Mobile action bar */}
      <MobileActionBar
        isDark={isDark}
        c={c}
        isJudging={isJudging}
        canJudge={canJudge}
        onRun={handleRun}
        onSubmit={handleSubmit}
      />

      {/* Main workspace */}
      <main className={`grid min-h-0 flex-1 gap-2 p-2 lg:h-full lg:overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(460px,0.98fr)] ${c.main}`}>
        {/* Left: Problem panel */}
        <ProblemLeftPanel
          problem={problem}
          isDark={isDark}
          c={c}
          isJudgeReady={isJudgeReady}
          activeProblemPanel={activeProblemPanel}
          submissions={submissions}
          submissionAnalytics={submissionAnalytics}
          submissionSource={submissionSource}
          selectedSubmission={selectedSubmission}
          isSubmissionDetailLoading={isSubmissionDetailLoading}
          selectedSubmissionMessage={selectedSubmissionMessage}
          onChangePanel={setActiveProblemPanel}
          onSelectSubmission={loadSubmissionDetail}
        />

        {/* Right: Editor + Output */}
        <section
          id="code-workspace"
          className={`scroll-mt-24 flex min-h-[min(72vh,820px)] flex-col overflow-hidden rounded-xl border shadow-sm transition-colors lg:h-full lg:min-h-0 ${c.editorPanel} ${
            isEditorMaximized ? "fixed inset-2 z-[120] min-h-0" : ""
          }`}
        >
          <ResizablePanel
            dark={isDark}
            storageKey={`wohotech-editor-split:${problem.slug}`}
            initialTopFraction={0.62}
            minTop={160}
            minBottom={140}
            className="flex-1 min-h-0"
            top={
              <CodeEditorPanel
                problem={problem}
                isDark={isDark}
                c={c}
                code={code}
                language={language}
                savedAt={savedAt}
                isJudging={isJudging}
                showAccepted={showAccepted}
                isSpecialProblem={isSpecialProblem}
                isSqlProblem={isSqlProblem}
                isShellProblem={isShellProblem}
                isConcurrencyProblem={isConcurrencyProblem}
                isLanguageExecutable={isLanguageExecutable}
                currentLanguageStatus={currentLanguageStatus}
                onCodeChange={setCode}
                onLanguageChange={changeLanguage}
                onRun={handleRun}
                onSave={saveCodeNow}
                onReset={resetCode}
              />
            }
            bottom={
              <TestResultsPanel
                problem={problem}
                isDark={isDark}
                c={c}
                result={result}
                isJudging={isJudging}
                canJudge={canJudge}
                hasResult={hasResult}
                activeBottomPanel={activeBottomPanel}
                activeCases={activeCases}
                isSpecialProblem={isSpecialProblem}
                isSqlProblem={isSqlProblem}
                selectedSampleCases={selectedSampleCases}
                customCases={customCases}
                customInput={customInput}
                customExpected={customExpected}
                customCaseError={customCaseError}
                selectedCases={selectedCases}
                judgeUnavailableMessage={judgeUnavailableMessage}
                onSetBottomPanel={setActiveBottomPanel}
                onToggleSampleCase={toggleSampleCase}
                onCustomInputChange={setCustomInput}
                onCustomExpectedChange={setCustomExpected}
                onAddCustomCase={addCustomCase}
                onRemoveCustomCase={removeCustomCase}
                onRun={handleRun}
                onSubmit={handleSubmit}
              />
            }
          />
        </section>
      </main>
    </div>
  );
}
