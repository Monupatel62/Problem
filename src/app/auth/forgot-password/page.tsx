"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email: email.trim().toLowerCase() }) });
    setLoading(false);
    if (res.ok) setSent(true);
    else { const d = await res.json().catch(()=>({})); setError(d.error ?? "Failed to send reset email."); }
  }
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        {sent ? (
          <div className="text-center">
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-400"/>
            <h2 className="text-xl font-black text-white">Check your email</h2>
            <p className="mt-2 text-sm text-white/50">Reset link sent to <strong className="text-white">{email}</strong></p>
            <Link href="/auth/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4"/> Back to sign in</Link>
          </div>
        ) : (
          <>
            <Link href="/auth/login" className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white"><ArrowLeft className="h-4 w-4"/> Back</Link>
            <h1 className="mb-1 text-2xl font-black text-white">Forgot password?</h1>
            <p className="mb-6 text-sm text-white/50">Enter your email to get a reset link.</p>
            {error && <div className="mb-4 rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-400 border border-red-900/50">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium text-white/60">Email</label>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition"/></div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white hover:bg-white/20 disabled:opacity-60 transition">
                {loading && <Loader2 className="h-4 w-4 animate-spin"/>} Send reset link
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
