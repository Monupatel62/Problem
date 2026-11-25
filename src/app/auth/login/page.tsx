"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const WOHO_AUTH_DOMAIN = "https://auth.wohotech.in";
const WOHO_CALLBACK    = "https://problem.wohotech.in/api/auth/callback/wohoauth";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("callbackUrl") ?? "/";
  const callbackUrl = (() => {
    try {
      const u = new URL(raw, window?.location?.origin ?? "http://localhost:3002");
      const path = u.pathname + u.search;
      return path === "/problems" ? "/" : path;
    } catch {
      return raw.startsWith("/") ? raw : "/";
    }
  })();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const res = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else router.push(callbackUrl);
  }

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl });
  }

  function handleWohoAuth() {
    const ssoUrl = `${WOHO_AUTH_DOMAIN}/api/sso/authorize?client_id=woho-code&redirect_uri=${encodeURIComponent(WOHO_CALLBACK)}&state=${encodeURIComponent(callbackUrl)}`;
    window.location.href = ssoUrl;
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-[#2d2d2d] bg-[#161616] p-8 shadow-2xl">
        <h1 className="mb-1 text-center text-2xl font-black text-white">Sign in</h1>
        <p className="mb-6 text-center text-sm text-[#888]">to continue to WohoCode</p>

        {/* Google */}
        <button type="button" onClick={handleGoogle} disabled={loading}
          className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-[#2d2d2d] bg-[#1e1e1e] py-2.5 text-sm font-semibold text-white hover:bg-[#2a2a2a] disabled:opacity-50 transition">
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* WohoAuth SSO */}
        <button type="button" onClick={handleWohoAuth} disabled={loading}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-[#3d2060] bg-[#1a1228] py-2.5 text-sm font-semibold text-[#c084fc] hover:bg-[#231537] disabled:opacity-50 transition">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          Continue with WohoAuth
        </button>

        <div className="relative my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#2d2d2d]"/>
          <span className="text-xs text-[#555]">or</span>
          <div className="h-px flex-1 bg-[#2d2d2d]"/>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-400 border border-red-900/50">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#aaa]">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full rounded-xl border border-[#2d2d2d] bg-[#0f0f0f] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none focus:border-[#ffa116] transition"/>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-[#aaa]">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-[#ffa116] hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full rounded-xl border border-[#2d2d2d] bg-[#0f0f0f] px-4 py-2.5 pr-11 text-sm text-white placeholder-[#555] outline-none focus:border-[#ffa116] transition"/>
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#aaa]">
                {showPwd ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffa116] py-2.5 text-sm font-bold text-[#0f0f0f] hover:bg-[#ffb84d] disabled:opacity-60 transition">
            {loading && <Loader2 className="h-4 w-4 animate-spin"/>}
            Sign in
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-[#555]">
        No account?{" "}
        <Link href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-[#ffa116] hover:underline">Sign up free</Link>
      </p>
    </div>
  );
}
