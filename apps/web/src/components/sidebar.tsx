"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  ReceiptText,
  Bell,
  LogOut,
  Package,
  ShoppingCart,
  Star,
  Store,
  X,
  CreditCard,
  UserCircle,
  FileDown,
  CirclePlus,
  Settings,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    matchPaths: ["/", "/dashboard"],
    exact: true,
  },
  {
    icon: Wallet,
    label: "Budget",
    href: "/budget",
    matchPaths: ["/budget"],
  },
  {
    icon: ReceiptText,
    label: "Expenses",
    href: "/expenses",
    matchPaths: ["/expenses"],
  },
  {
    icon: Store,
    label: "Shop",
    href: "/vendors",
    matchPaths: ["/vendors"],
  },
  {
    icon: ShoppingCart,
    label: "Products",
    href: "/products",
    matchPaths: ["/products"],
  },
  {
    icon: TrendingUp,
    label: "Live Prices",
    href: "/live-price",
    matchPaths: [ "/live-price", "/price-trends"],
  },

  // {
  //   icon: Bell,
  //   label: "Notifications",
  //   href: "/notifications",
  //   matchPaths: ["/notifications"],
  // },
  // {
  //   icon: Settings,
  //   label: "Settings",
  //   href: "/settings",
  //   matchPaths: ["/settings"],
  // },
  // {
  //   icon: UserCircle,
  //   label: "Profile",
  //   href: "/profile",
  //   matchPaths: ["/profile"],
  // },
  {
    icon: CirclePlus,
    label: "Submit price",
    href: "/market/submit",
    matchPaths: ["/market/submit"],
  },


  // {
  //   icon: Store,
  //   label: "Vendor Directory",
  //   href: "/shop/vendors",
  //   matchPaths: ["/shop/vendors"],
  // },
  // {
  //   icon: ShoppingCart,
  //   label: "Cart",
  //   href: "/cart",
  //   matchPaths: ["/cart"],
  // },
  // {
  //   icon: Wallet,
  //   label: "Checkout",
  //   href: "/checkout",
  //   matchPaths: ["/checkout"],
  // },
  {
    icon: Package,
    label: "Orders",
    href: "/orders",
    matchPaths: ["/orders"],
  },
  // {
  //   icon: Star,
  //   label: "Write Review",
  //   href: "/reviews/new",
  //   matchPaths: ["/reviews", "/reviews/new"],
  // },
    {
    icon: FileDown,
    label: "Export reports",
    href: "/reports",
    matchPaths: ["/reports"],
  }
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}


export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isPathActive = useCallback(
    (currentPath: string, candidatePaths: string[], exact?: boolean) => {
      return candidatePaths.some((path) => {
        if (exact) return currentPath === path;
        return currentPath === path || currentPath.startsWith(`${path}/`);
      });
    },
    []
  );

  return (
    <aside
      className={`
        ${mobile ? "fixed inset-y-0 left-0 z-50 w-64 shadow-2xl" : "hidden md:flex w-64 shrink-0 sticky top-0"} 
        flex h-screen flex-col justify-between bg-background border-r border-border transition-all duration-200
      `}
    >
      {/* Scrollable Navigation Area */}
      <div className="flex flex-col gap-6 overflow-y-auto py-6">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6">
          <Link 
            href="/" 
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            onClick={mobile ? onClose : undefined}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <CreditCard className="size-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-none text-foreground">MarketSight</h1>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Ethiopia</p>
            </div>
          </Link>

          {mobile && (
            <button 
              onClick={onClose} 
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col">
          {navItems.map((item) => {
            const isActive = isPathActive(pathname, item.matchPaths, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={mobile ? onClose : undefined}
                className={`
                  group flex items-center py-3 pl-6 pr-4 cursor-pointer transition-all duration-200
                  ${isActive 
                    ? "text-primary font-bold border-r-4 border-primary bg-primary/10" 
                    : "text-muted-foreground font-medium hover:bg-secondary hover:text-foreground"
                  }
                `}
              >
                <item.icon 
                  className={`mr-3 size-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`} 
                />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="flex flex-col gap-2 border-t border-border p-4">
        <div className="mb-2 px-2">
          <p className="text-xs font-medium text-muted-foreground">
            Logged in as <span className="font-bold text-foreground capitalize">{user?.role ?? "User"}</span>
          </p>
        </div>
        
        <Button 
          variant={'ghost'}
          onClick={()=>{signOut(); router.push("/login");}} 
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Log Out</span>
        </Button>
      </div>
    </aside>
  );
}
