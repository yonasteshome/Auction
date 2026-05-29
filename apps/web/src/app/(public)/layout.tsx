import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold text-[#135bec]">
            SpendSense
          </Link>
          <div className="flex gap-4 text-sm font-medium text-slate-600">
            <Link href="/about" className="hover:text-[#135bec]">
              About
            </Link>
            <Link href="/help" className="hover:text-[#135bec]">
              Help
            </Link>
            <Link href="/login" className="hover:text-[#135bec]">
              Sign in
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
    </div>
  );
}
