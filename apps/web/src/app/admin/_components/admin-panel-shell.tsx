"use client"
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@repo/ui/components/button";
import { useState } from "react";
import {
    Bell,
    Bot,
    Gavel,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    ReceiptText,
    User,
    Search,
    Settings,
    Settings2,
    Shapes,
    ShieldCheck,
    Store,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

type PanelTab = "dashboard" | "users" | "vendors" | "verification" | "moderation" | "settings" | "categories" | "ml" | "audit";

interface AdminPanelShellProps {
  title: string;
  subtitle: string;
  activeTab: PanelTab;
  children: ReactNode;
}

const NAV = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "users", label: "Users", href: "/admin/users", icon: <Users size={18} /> },
  { key: "vendors", label: "Vendors", href: "/admin/vendors", icon: <Store size={18} /> },
  { key: "verification", label: "Vendor Verification", href: "/admin/vendor-verification", icon: <ShieldCheck size={18} /> },
  { key: "moderation", label: "Price Moderation", href: "/admin/price-moderation", icon: <Gavel size={18} /> },
  // { key: "settings", label: "System Settings", href: "/admin/system-settings", icon: <Settings2 size={18} /> },
  // { key: "categories", label: "Categories", href: "/admin/categories", icon: <Shapes size={18} /> },
  // { key: "ml", label: "ML Monitoring", href: "/admin/ml-monitoring", icon: <Bot size={18} /> },
  // { key: "audit", label: "Audit Logs", href: "/admin/audit-logs", icon: <ReceiptText size={18} /> },
] as const;

export default function AdminPanelShell({ title, subtitle, activeTab, children }: AdminPanelShellProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    await signOut();
    router.push("/login");
  };
  
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318] antialiased">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-8 ">
          <div className="my-8 px-5 ">
            <h2 className="text-lg font-black tracking-tight text-blue-700">MarketSight Admin</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Precision Spend Analysis</p>
          </div>
          {/* <div className="hidden w-72 items-center rounded-lg bg-slate-100 px-3 py-1.5 md:flex">
            <Search className="text-slate-500" size={16} />
            <input className="w-full border-none bg-transparent pl-2 text-sm outline-none" placeholder="Search admin panel..." type="text" />
          </div> */}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="flex shrink-0 items-center gap-3 rounded-full py-1 pl-4 pr-1 transition-colors focus:outline-none">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-bold leading-none text-slate-900">
                    {user?.full_name ?? "Admin User"}
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {user?.role ?? "Administrator"}
                  </p>
                </div>
                <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                  <User size={16} />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name ?? "Admin User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email ?? "admin@MarketSight.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 size-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        <aside className="fixed left-0 top-16 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-slate-200 bg-slate-50 px-4 py-6">

          <nav className="flex-1 space-y-1">
            {NAV.map((item) => {
              const isActive = item.key === activeTab;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive ? "border-r-4 border-blue-600 bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-blue-600",
                  ].join(" ")}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <Button 
            variant={'ghost'}
            onClick={() => setShowLogoutDialog(true)} 
            className="mt-auto w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600" type="button">
            <LogOut size={18} /> Logout
          </Button>
        </aside>

        <main className="ml-64 flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page and will need to log back in to access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 text-white hover:bg-red-700">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

