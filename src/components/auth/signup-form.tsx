"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getEmailValidationError } from "@/lib/auth-email";
import { normalizeAuthCallbackPath } from "@/lib/post-auth-redirect";

type Props = { callbackUrl: string };

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

function UserIcon() {
  return (
    <svg className="h-5 w-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
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

function AtIcon() {
  return (
    <svg className="h-5 w-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"/>
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

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;

  const hasLength = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[@#$!%*?]/.test(value);
  const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const label = score <= 2 ? "Weak" : score <= 3 ? "Medium" : "Strong";
  const color = score <= 2 ? "bg-red-500" : score <= 3 ? "bg-yellow-500" : "bg-green-500";
  const textColor = score <= 2 ? "text-red-500" : score <= 3 ? "text-yellow-500" : "text-green-500";

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? color : "bg-[var(--border)]"}`} />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${textColor}`}>{label}</p>
    </div>
  );
}

export function SignupForm({ callbackUrl }: Props) {
  const router = useRouter();
  const safeCallbackUrl = normalizeAuthCallbackPath(callbackUrl);
  const postSignupCallbackUrl = `/auth/continue?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [username, setUsername] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="min-h-screen" />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();

    if (!trimmedName || !trimmedEmail || !pw) {
      setError("Name, email, and password are required.");
      setLoading(false);
      return;
    }

    const emailError = getEmailValidationError(trimmedEmail);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    if (pw.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?])[A-Za-z\d@#$!%*?]{8,}$/;
    if (!strongRegex.test(pw)) {
      setError("Password must include uppercase, lowercase, number, and special char (@#$!%*?).");
      setLoading(false);
      return;
    }

    if (!agreed) {
      setError("Please agree to the Terms & Privacy Policy.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password: pw }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setLoading(false);
        setError(payload?.error ?? "Unable to create account.");
        return;
      }

      setLoading(false);
      const verifyEmail = payload?.email ?? trimmedEmail;
      const devOtp = payload?.devOtp;
      const target = devOtp
        ? `/verify-email?email=${encodeURIComponent(verifyEmail)}&devOtp=${encodeURIComponent(devOtp)}`
        : `/verify-email?email=${encodeURIComponent(verifyEmail)}`;
      router.push(target);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  async function handleGoogle() {
    setOauthLoading("google");
    setError("");
    await signIn("google", { callbackUrl: postSignupCallbackUrl });
  }

  async function handleGithub() {
    setOauthLoading("github");
    setError("");
    await signIn("github", { callbackUrl: postSignupCallbackUrl });
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600">
        {/* Mesh overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          {/* Logo */}
          <div className="mb-6">
            <img src="/images/logos/WohoTech_logo.png" alt="WoHoTech" width={80} height={80} className="h-20 w-20 rounded-2xl object-contain bg-white/10 backdrop-blur-sm p-2" />
          </div>

          {/* Tagline */}
          <h1 className="text-4xl xl:text-5xl font-light text-white text-center mb-12 tracking-wide">
            Join the community
          </h1>

          {/* Floating cards */}
          <div className="flex flex-wrap justify-center gap-4 max-w-lg">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 transform rotate-2 hover:rotate-0 transition-transform duration-300 shadow-xl">
              <p className="text-white font-bold text-lg">🎓 Free Learning</p>
              <p className="text-white/70 text-sm">All courses, forever free</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300 shadow-xl mt-4">
              <p className="text-white font-bold text-lg">🤖 WoHo AI</p>
              <p className="text-white/70 text-sm">Smart study tools</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 transform rotate-1 hover:rotate-0 transition-transform duration-300 shadow-xl">
              <p className="text-white font-bold text-lg">🚀 Career Growth</p>
              <p className="text-white/70 text-sm">DSA, projects, interviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-[40%] flex-col items-center justify-center px-6 py-8 bg-[var(--bg)] overflow-y-auto">
        {/* Mobile gradient header */}
        <div className="lg:hidden w-full mb-6 -mt-8 -mx-6 px-6 py-8 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 rounded-b-3xl flex flex-col items-center">
          <img src="/images/logos/WohoTech_logo.png" alt="WoHoTech" width={48} height={48} className="h-12 w-12 rounded-xl object-contain bg-white/10 backdrop-blur-sm p-1 mb-3" />
          <p className="text-white text-xl font-light tracking-wide">Join the community</p>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <h2 className="text-2xl font-bold text-[var(--text)] mb-1">Create your account</h2>
          <p className="text-[var(--muted)] text-sm mb-6">Start learning for free today</p>

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
          <div className="relative flex items-center my-5">
            <div className="flex-1 border-t border-[var(--border)]" />
            <span className="mx-4 text-xs text-[var(--muted)] bg-[var(--bg)] px-2">or continue with email</span>
            <div className="flex-1 border-t border-[var(--border)]" />
          </div>

          {/* Form */}
          <form noValidate onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <UserIcon />
              </div>
              <input
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Full Name"
                className="w-full h-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
              />
            </div>

            {/* Email */}
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
                  autoComplete="new-password"
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
              <PasswordStrength value={pw} />
            </div>

            {/* Username */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <AtIcon />
              </div>
              <input
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                autoComplete="username"
                placeholder="Username (optional)"
                className="w-full h-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
              />
              {username && (
                <p className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">
                  @{username}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-pink-500 focus:ring-pink-500/20 accent-pink-500"
              />
              <span className="text-xs text-[var(--muted)] group-hover:text-[var(--text)] transition">
                I agree to the{" "}
                <Link href="/terms" className="text-pink-500 hover:underline">Terms of Service</Link>
                {" "}&{" "}
                <Link href="/privacy" className="text-pink-500 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!oauthLoading}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25"
            >
              {loading ? <><Spinner /> Creating account...</> : "Create Account"}
            </button>
          </form>

          {/* Bottom link */}
          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-pink-500 hover:text-pink-600 transition">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
