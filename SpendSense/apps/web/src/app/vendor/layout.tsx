import type { ReactNode } from "react";
import { Search, Bell } from "lucide-react";
import { VendorSidebar } from "./_components/vendor-shell";
import { VerificationGuard } from "./_components/verification-guard";

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <VerificationGuard>
      <div className="min-h-screen bg-[#f6f6f8] text-[#111318] antialiased">
        <VendorSidebar />

        <header className="sticky top-0 z-40 h-16 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-md md:ml-64 md:w-[calc(100%-16rem)] md:px-8">
          <div className="flex h-full items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                className="w-full rounded-lg bg-[#f0f2f4] py-2 pl-10 pr-4 text-sm placeholder:text-slate-500/70 focus:outline-none"
                placeholder="Search orders, products, or customers..."
                type="text"
              /> */}
            </div>

            <div className="flex items-center gap-3">
              {/* <button className="relative p-2 text-slate-500 transition hover:text-[#135bec]" type="button">
                <Bell size={18} />
              </button> */}
              {/* <div className="mx-1 hidden h-8 w-px bg-slate-300 sm:block" /> */}
              {/* <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-bold text-slate-900">Vendor Team</p>
                  <p className="text-[10px] text-slate-500">Console</p>
                </div>
                <img
                  alt="Vendor avatar"
                  className="h-9 w-9 rounded-full border border-slate-300/40 object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop"
                />
              </div> */}
            </div>
          </div>
        </header>

        {children}
      </div>
    </VerificationGuard>
  );
}
