"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { MobileHeader } from "@/components/mobile-header";

type UserAppShellProps = {
  children: React.ReactNode;
};

export function UserAppShell({ children }: UserAppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#f6f6f8] text-[#111318] dark:bg-[#101622] dark:text-gray-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar & Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
        </>
      )}

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <div className="hidden md:block">
          <Navbar />
        </div>
        
        <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] p-6 md:p-8 lg:p-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}