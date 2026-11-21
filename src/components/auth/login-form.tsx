"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getEmailValidationError } from "@/lib/auth-email";
import { normalizeAuthCallbackPath } from "@/lib/post-auth-redirect";

type Props = {
  callbackUrl: string;
  authError?: string;
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.97c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.38-.01 2.49-.01 2.82 0 .27.18.59.69.49A10.18 10.18 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
    </svg>
  );
}

export function LoginForm({ callbackUrl, authError }: Props) {
  const [mounted, setMounted] = useState(false);
  const safeCallbackUrl = normalizeAuthCallbackPath(callbackUrl);
  const postLoginCallbackUrl = `/auth/continue?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`;
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState(authError ?? "");

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-sm font-medium text-[var(--muted)]">
        Loading sign in...
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail || !pw) {
      setLoading(false);
      setError("Email and password are required.");
      return;
    }

    const emailError = getEmailValidationError(trimmedEmail);
    if (emailError) {
      setLoading(false);
      setError(emailError);
      return;
    }

    if (pw.length < 8) {
      setLoading(false);
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: trimmedEmail,
        password: pw,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      if (!result?.ok) {
        setError("Sign in failed. Please try again.");
        return;
      }

      window.location.href = postLoginCallbackUrl;
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  async function handleGoogle() {
    setOauthLoading("google");
    setError("");
    await signIn("google", { callbackUrl: postLoginCallbackUrl });
  }

  async function handleGithub() {
    setOauthLoading("github");
    setError("");
    await signIn("github", { callbackUrl: postLoginCallbackUrl });
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600">
        {/* Mesh/animated overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          {/* Logo */}
          <div className="mb-6">
            <img src="/images/logos/WohoTech_logo.png" alt="WoHoTech" width={80} height={80} className="h-20 w-20 rounded-2xl object-contain bg-white/10 backdrop-blur-sm p-2" />
          </div>

          {/* Tagline */}
          <h1 className="text-4xl xl:text-5xl font-light text-white text-center mb-12 tracking-wide">
            Learn. Create. Grow.
          </h1>

          {/* Floating cards */}
          <div className="flex flex-wrap justify-center gap-4 max-w-lg">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300 shadow-xl">
              <p className="text-white font-bold text-lg">🤖 AI Assistant</p>
              <p className="text-white/70 text-sm">Ask anything, get instant answers</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 transform rotate-2 hover:rotate-0 transition-transform duration-300 shadow-xl mt-4">
              <p className="text-white font-bold text-lg">📚 28+ Subjects</p>
              <p className="text-white/70 text-sm">CS & Engineering topics</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 transform -rotate-1 hover:rotate-0 transition-transform duration-300 shadow-xl">
              <p className="text-white font-bold text-lg">💻 Practice DSA</p>
              <p className="text-white/70 text-sm">Code, compile & submit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-[40%] flex-col items-center justify-center px-6 py-12 bg-[var(--bg)]">
        {/* Mobile gradient header */}
        <div className="lg:hidden w-full mb-8 -mt-12 -mx-6 px-6 py-10 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 rounded-b-3xl flex flex-col items-center">
          <img src="/images/logos/WohoTech_logo.png" alt="WoHoTech" width={48} height={48} className="h-12 w-12 rounded-xl object-contain bg-white/10 backdrop-blur-sm p-1 mb-3" />
          <p className="text-white text-xl font-light tracking-wide">Learn. Create. Grow.</p>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <h2 className="text-2xl font-bold text-[var(--text)] mb-1">Welcome back</h2>
          <p className="text-[var(--muted)] text-sm mb-8">Log in to WoHoTech</p>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-medium text-sm transition hover:bg-[var(--surface-alt)] disabled:opacity-60"
            >
              {oauthLoading === "google" ? <Spinner /> : <GoogleIcon />}
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleGithub}
              disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-medium text-sm transition hover:bg-[var(--surface-alt)] disabled:opacity-60"
            >
              {oauthLoading === "github" ? <Spinner /> : <GitHubIcon />}
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-1 border-t border-[var(--border)]" />
            <span className="mx-4 text-xs text-[var(--muted)] bg-[var(--bg)] px-2">or continue with email</span>
            <div className="flex-1 border-t border-[var(--border)]" />
          </div>

          {/* Form */}
          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <MailIcon />
                </div>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Email address"
                  className="w-full h-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <LockIcon />
                </div>
                <input
                  name="pw"
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Password"
                  className="w-full h-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-11 pr-12 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition"
                >
                  {showPw ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-xs font-medium text-pink-500 hover:text-pink-600 transition">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!oauthLoading}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25"
            >
              {loading ? <><Spinner /> Signing in...</> : "Log In"}
            </button>
          </form>

          {/* Bottom link */}
          <p className="mt-8 text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-pink-500 hover:text-pink-600 transition">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
