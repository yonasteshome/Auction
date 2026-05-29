"use client";

import { useAuth } from "@/providers/auth-provider";
import { Button } from "@repo/ui/components/button";
import {
    BarChart3,
    CircleUserRound,
    LayoutDashboard,
    LogOut,
    Package,
    ShoppingCart,
    Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/profile", label: "Profile", icon: CircleUserRound },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
];

function isActiveLink(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface VendorShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function VendorSidebar() {
  const pathname = usePathname();
    const router = useRouter();
  const { signOut } = useAuth();
  
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-slate-200/70 bg-[#f6f6f8] px-4 py-6 md:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#135bec] text-white shadow-sm">
          <Store size={18} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#135bec]">SpendSense</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ethiopia Vendor</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_LINKS.map((item) => {
          const Icon = item.icon;
          const active = isActiveLink(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200",
                active ? "bg-white font-bold text-[#135bec] shadow-sm" : "text-slate-500 hover:bg-[#f0f2f4] hover:text-[#135bec]",
              ].join(" ")}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200/70 pt-6">
        <Button 
          variant={'ghost'}
          onClick={()=>{signOut(); router.push("/login");}} 
          className="mt-8 w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600" type="button">
          <LogOut size={18} /> Logout
        </Button>
      </div>
    </aside>
  );
}

export function VendorShell({ title, description, children }: VendorShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">SpendSense Vendor Panel</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
          <nav className="mt-4 flex flex-wrap gap-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <section>{children}</section>
      </div>
    </div>
  );
}
