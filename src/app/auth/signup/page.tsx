"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/problems";
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setLoading(false); setError(d.error ?? "Registration failed."); return; }
    const sr = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
    setLoading(false);
    if (sr?.error) router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    else router.push(callbackUrl);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-[#2d2d2d] bg-[#161616] p-8 shadow-2xl">
        <h1 className="mb-1 text-center text-2xl font-black text-white">Create account</h1>
        <p className="mb-6 text-center text-sm text-[#888]">Start coding on WohoCode</p>

        {error && <div className="mb-4 rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-400 border border-red-900/50">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full name", type: "text", value: name, set: setName, placeholder: "Your name", autoComplete: "name" },
            { label: "Email", type: "email", value: email, set: setEmail, placeholder: "you@example.com", autoComplete: "email" },
          ].map(({ label, type, value, set, placeholder, autoComplete }) => (
            <div key={label}>
              <label className="mb-1.5 block text-sm font-medium text-[#aaa]">{label}</label>
              <input type={type} required value={value} onChange={e => set(e.target.value)}
                placeholder={placeholder} autoComplete={autoComplete}
                className="w-full rounded-xl border border-[#2d2d2d] bg-[#0f0f0f] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none focus:border-[#ffa116] transition"/>
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#aaa]">Password</label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} required value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-[#2d2d2d] bg-[#0f0f0f] px-4 py-2.5 pr-11 text-sm text-white placeholder-[#555] outline-none focus:border-[#ffa116] transition"/>
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#aaa]">
                {showPwd ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffa116] py-2.5 text-sm font-bold text-[#0f0f0f] hover:bg-[#ffb84d] disabled:opacity-60 transition">
            {loading && <Loader2 className="h-4 w-4 animate-spin"/>}
            Create account
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-[#555]">
        Already have an account?{" "}
        <Link href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-[#ffa116] hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
