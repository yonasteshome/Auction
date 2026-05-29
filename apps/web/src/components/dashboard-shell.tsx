"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { Navbar } from "./navbar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(19,91,236,0.08),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#f6f6f8_100%)] text-[#111318] dark:bg-[#101622] dark:text-gray-100">
      <Sidebar mobile={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {mobileMenuOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          type="button"
        />
      )}

      <Navbar />
      <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />

      <main className="relative z-10 flex min-h-screen flex-col overflow-x-hidden lg:pl-72 lg:pt-0">
        <div className="mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
