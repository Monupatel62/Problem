"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Code2, Search, ChevronDown, Moon, Sun } from "lucide-react";

export function SiteHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/problems?q=${encodeURIComponent(query.trim())}`);
  }

  const nav = [
    { label: "Problems", href: "/problems" },
    { label: "Code Editor", href: "/code" },
    { label: "Interview", href: "/problems?tab=interview" },
    { label: "Study Plans", href: "/problems/study-plan" },
  ];

  return (
    <header className="sticky top-0 z-50 flex h-[50px] items-center gap-3 border-b border-[#2d2d2d] bg-[#1a1a1a] px-4">
      {/* Logo */}
      <Link href="/problems" className="flex items-center gap-2 shrink-0 mr-2">
        <Code2 className="h-5 w-5 text-[#ffa116]" />
        <span className="font-black text-base text-white hidden sm:inline">WohoCode</span>
      </Link>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {nav.map((item) => (
          <Link key={item.href} href={item.href}
            className={`px-3 py-1.5 text-sm rounded-md transition ${
              pathname.startsWith(item.href.split("?")[0])
                ? "text-white bg-[#2d2d2d]"
                : "text-[#eff1f6]/70 hover:text-white hover:bg-[#2d2d2d]"
            }`}>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Search */}
      <form onSubmit={handleSearch} className="hidden md:flex mx-auto max-w-xs flex-1 items-center">
        <div className="flex w-full items-center rounded-lg border border-[#3d3d3d] bg-[#2d2d2d] px-3 py-1.5 gap-2">
          <Search className="h-3.5 w-3.5 text-[#6b7280] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6b7280] outline-none"
          />
        </div>
      </form>

      {/* Auth */}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {session ? (
          <>
            <span className="hidden sm:block text-xs text-[#6b7280]">{session.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/problems" })}
              className="rounded-lg border border-[#3d3d3d] px-3 py-1.5 text-xs text-[#eff1f6]/70 hover:text-white hover:border-[#555] transition">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login?callbackUrl=/problems"
              className="px-3 py-1.5 text-sm text-[#eff1f6]/70 hover:text-white transition">
              Sign in
            </Link>
            <Link href="/auth/signup?callbackUrl=/problems"
              className="rounded-lg bg-[#ffa116] px-3 py-1.5 text-sm font-semibold text-[#1a1a1a] hover:bg-[#ffb84d] transition">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
