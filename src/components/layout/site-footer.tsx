import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#2d2d2d] bg-[#1a1a1a] px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-[#6b7280]">
        <span>© {new Date().getFullYear()} WohoCode · Part of WoHoTech</span>
        <nav className="flex gap-4">
          <Link href="/problems" className="hover:text-[#eff1f6] transition">Problems</Link>
          <Link href="/code" className="hover:text-[#eff1f6] transition">Editor</Link>
          <a href="https://wohotech.in" className="hover:text-[#eff1f6] transition">WoHoTech</a>
        </nav>
      </div>
    </footer>
  );
}
