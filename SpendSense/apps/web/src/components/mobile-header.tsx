"use client";

import { Menu, Search } from "lucide-react";
import { HeaderNotifications } from "@/components/header-notifications";

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#cbd5e1]/70 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-slate-950/85">
      <button
        aria-label="Open navigation"
        className="inline-flex size-11 items-center justify-center rounded-xl border border-[#dbdfe6] bg-[#f6f6f8] text-slate-600 transition-colors hover:text-[#135bec] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        onClick={onMenuOpen}
        type="button"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#dbdfe6] bg-[#f6f6f8] px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
        <Search className="size-4 shrink-0 text-slate-500" />
        <input
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
          placeholder="Search analytics..."
          type="text"
        />
      </div>

      <HeaderNotifications className="border-[#dbdfe6] bg-[#f6f6f8] dark:border-slate-800 dark:bg-slate-900" />
    </header>
  );
}
