"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, ShoppingCart, Package, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { HeaderNotifications } from "@/components/header-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
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
import { Button } from "@repo/ui/components/button";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Budget", href: "/budget" },
  { label: "Live Prices", href: "/market" },
  { label: "Expenses", href: "/expenses" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    await signOut();
    toast.success("Successfully logged out");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/70 px-4 backdrop-blur-lg transition-all duration-300 dark:border-slate-800/50 dark:bg-slate-950/70 sm:px-8">
      
      {/* Search Input */}
      

      {/* Right Side Actions & Profile */}
      <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
        
        {/* Navigation Links */}
        <nav className="mr-2 hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex h-16 items-center text-sm font-semibold transition-colors ${
                  isActive 
                    ? "text-[#135bec]" 
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {link.label}
                {/* Premium Active Bottom Border Indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.75 w-full rounded-t-full bg-[#135bec]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Vertical Divider */}
        <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 lg:block" />

        <HeaderNotifications />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"} size={"lg"}
             className="flex shrink-0 items-center gap-3 rounded-full  py-1 pl-4 pr-1 backdrop-blur-sm transition-colors hover:border-slate-300/50 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135bec]/50">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold leading-none text-slate-900 dark:text-white">
                  {user?.full_name ?? "Abebe Kebede"}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  {user?.role ?? "Customer"}
                </p>
              </div>
              {/* <User className="size-8 rounded-full text-white bg-primary bg-cover bg-center shadow-sm ring-1 ring-slate-200/50 dark:bg-slate-800 dark:ring-slate-700/50"/> */}
              <div 
                className="size-8 rounded-full bg-slate-200 bg-cover bg-center shadow-sm ring-1 ring-slate-200/50 dark:bg-slate-800 dark:ring-slate-700/50"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbBNiUzh6h-w1FOiRq11HgEilm9CKLuP1xduf7FkBdPJP6ama6AiiN7nPK5VcoUwE0LyZoCBhQ8A2yiaCO6_fFd2ky8mZ861AVZnDoxM7c3cXl3GaJt14BdmPOgHs_KLeTeZlrm9MQhoXFenCdf2vXV1iEI_88woAVO3EPefcz0ixzq5Ml7-vOF7TgNJ7UqkX_qYCAOjfG_LzIEICLm2KhZGzafuEy_FXFzZHRC72FqnrETtI4m_fPc7xT57SrcKVqG_krPN0BJGI')" }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name ?? "Abebe Kebede"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email ?? "abebe@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex w-full cursor-pointer items-center">
                <User className="mr-2 size-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/cart" className="flex w-full cursor-pointer items-center">
                <ShoppingCart className="mr-2 size-4" />
                <span>Cart</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/orders" className="flex w-full cursor-pointer items-center">
                <Package className="mr-2 size-4" />
                <span>Orders</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => { 
                e.preventDefault(); 
                setShowLogoutDialog(true); 
              }} 
              className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50 dark:focus:text-red-500 cursor-pointer"
            >
              <LogOut className="mr-2 size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the login page and will need to log back in to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700">
                Log out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}