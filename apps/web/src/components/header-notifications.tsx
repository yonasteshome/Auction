"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Bell, Loader2, CheckCircle2, X, CircleDollarSign, AlertTriangle, ClipboardCheck, Store, Info, BellDot } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { useAuth } from "@/providers/auth-provider";
import { useRealtime } from "@/providers/realtime-provider";
import { listNotifications, patchNotification, bulkUpdateNotifications, type InAppNotification } from "@/services/userService";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 7;

type FilterTab = "All" | "Price" | "Budget" | "Submissions" | "Vendor";

function labelForType(type: string): { label: string; icon: React.ReactNode; tab: FilterTab } {
  if (type.includes("price")) return { label: "Price alert", icon: <CircleDollarSign className="size-4 text-emerald-600 dark:text-emerald-500" />, tab: "Price" };
  if (type.includes("budget")) return { label: "Budget", icon: <AlertTriangle className="size-4 text-amber-500" />, tab: "Budget" };
  if (type === "submission_status") return { label: "Crowdsource", icon: <ClipboardCheck className="size-4 text-blue-500" />, tab: "Submissions" };
  if (type.includes("vendor")) return { label: "Vendor", icon: <Store className="size-4 text-purple-500" />, tab: "Vendor" };
  return { label: type.replace(/_/g, " "), icon: <Info className="size-4 text-slate-500" />, tab: "All" };
}

export function HeaderNotifications({ className }: { className?: string }) {
  const { accessToken, status } = useAuth();
  const { eventVersion } = useRealtime();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [justArrived, setJustArrived] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!accessToken) return;
    if (!silent) setLoading(true);
    try {
      const data = await listNotifications(accessToken);
      const newItems = Array.isArray(data.results) ? data.results : [];
      setItems(newItems);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated" && accessToken) void load();
  }, [status, accessToken, load]);

  // Handle realtime events
  useEffect(() => {
    if (status === "authenticated" && accessToken && eventVersion > 0) {
      setJustArrived(true);
      void load(true);
      const timer = setTimeout(() => setJustArrived(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [eventVersion, status, accessToken, load]);

  useEffect(() => {
    if (open && accessToken) void load(true);
  }, [open, accessToken, load]);

  const handleMarkAllRead = async () => {
    if (!accessToken) return;
    const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    try {
      await bulkUpdateNotifications(accessToken, "mark_read", unreadIds);
      setItems(items.map((i) => ({ ...i, is_read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkRead = async (id: number) => {
    if (!accessToken) return;
    try {
      setItems(items.map(i => i.id === id ? { ...i, is_read: true } : i));
      await patchNotification(accessToken, id, { is_read: true });
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleDismiss = async (id: number) => {
    if (!accessToken) return;
    try {
      setItems(items.filter(i => i.id !== id));
      await patchNotification(accessToken, id, { is_archived: true });
    } catch {
      toast.error("Failed to archive notification");
    }
  };

  if (status !== "authenticated") {
    return null;
  }

  const filteredItems = items.filter(n => !n.is_archived && (activeTab === "All" || labelForType(n.type).tab === activeTab));
  const unreadItems = items.filter((n) => !n.is_read && !n.is_archived);
  const unreadCount = unreadItems.length;
  const isCritical = unreadItems.some(n => labelForType(n.type).tab === "Budget");
  const preview = filteredItems.slice(0, PREVIEW_LIMIT);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          type="button"
          aria-label={`Notifications, ${unreadCount} unread`}
          aria-expanded={open}
          aria-live="polite"
          className="rounded-full py-2 relative"
          size={"lg"}
          // className={cn(
          //   "relative flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200/50 bg-white/50 text-slate-600 backdrop-blur-sm transition-all hover:border-[#135bec]/30 hover:text-[#135bec] dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:text-[#135bec]",
          //   justArrived && "animate-in zoom-in-95",
          //   className,
          // )}
        >
          <Bell className={cn("size-5", isCritical && unreadCount > 0 && "animate-pulse text-red-500", justArrived && "animate-bounce")} />
          {unreadCount > 0 ? (
            <span className={cn(
              "absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-950 transition-all",
              isCritical ? "animate-pulse bg-red-500" : "bg-primary",
              justArrived && "animate-bounce"
            )}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,22rem)] border-slate-200 p-0 shadow-lg dark:border-slate-800 sm:w-[30rem]"
      >
        <div className="flex flex-col border-b border-slate-100 p-3 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-8 text-xs font-medium text-primary hover:text-primary dark:text-primary">
                Mark all as read
              </Button>
            )}
          </div>
          <div className="mt-3 px-3 pb-2">
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as FilterTab)} className="w-full">
              <div className="overflow-x-auto custom-scrollbar pb-1">
                <TabsList className="w-max p-1 h-auto rounded-lg bg-slate-100 dark:bg-slate-900/50">
                  {(["All", "Price", "Budget", "Submissions", "Vendor"] as FilterTab[]).map(tab => {
                    const tabUnread = items.filter(n => !n.is_read && !n.is_archived && (tab === "All" || labelForType(n.type).tab === tab)).length;
                    return (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="px-3 py-1.5 text-xs rounded-md relative"
                      >
                        <div className="flex items-center gap-1.5">
                          {tab === "All" && <BellDot className="size-3.5 text-slate-500" />}
                          {tab === "Price" && <CircleDollarSign className="size-3.5 text-emerald-500" />}
                          {tab === "Budget" && <AlertTriangle className="size-3.5 text-amber-500" />}
                          {tab === "Submissions" && <ClipboardCheck className="size-3.5 text-blue-500" />}
                          {tab === "Vendor" && <Store className="size-3.5 text-purple-500" />}
                          <span>{tab}</span>
                          {tabUnread > 0 && (
                            <span className={cn(
                              "inline-flex size-1.5 rounded-full",
                              activeTab === tab ? "bg-foreground" : "bg-primary"
                            )} />
                          )}
                        </div>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>
            </Tabs>
          </div>
        </div>

        <div className="max-h-100 overflow-y-auto custom-scrollbar">
          {loading && items.length === 0 ? (
            <div className="flex flex-col gap-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : preview.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full border border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500 mb-3">
                 <Bell className="size-6" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No new notifications</p>
              <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {preview.map((n) => {
                const { label, icon } = labelForType(n.type);
                return (
                  <li
                    key={n.id}
                    className={cn(
                      "group relative flex gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/60 focus-within:bg-slate-50 dark:focus-within:bg-slate-900/60",
                      !n.is_read && "bg-primary/5"
                    )}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-lg leading-none">
                      {icon}
                    </div>
                    <div className="flex-1 space-y-1 pr-12">
                      <p className={cn("text-sm line-clamp-2", !n.is_read ? "font-medium text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-primary">{label}</span>
                        <span>&middot;</span>
                        <span>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                      </div>
                      {n.metadata?.url && (
                        <div className="pt-1">
                          <Link href={n.metadata.url} onClick={() => setOpen(false)} className="text-[11px] font-medium text-primary hover:underline">
                            View details
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute right-2 top-3 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 focus:opacity-100"
                          title="Mark read"
                          aria-label="Mark as read"
                        >
                          <CheckCircle2 className="size-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(n.id)}
                        className="flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-500 focus:opacity-100"
                        title="Dismiss"
                        aria-label="Dismiss"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 p-2 dark:border-slate-800">
          <Button
            variant="ghost"
            className="group flex h-9 w-full items-center justify-center gap-1 text-sm font-medium text-primary hover:bg-slate-50 dark:hover:bg-slate-900"
            asChild
          >
            <Link href="/notifications" onClick={() => setOpen(false)}>
              View all notifications <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
