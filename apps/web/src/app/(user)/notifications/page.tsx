"use client";

import { NotificationsListSkeleton } from "@/components/notifications/notifications-page-skeleton";
import { useAuth } from "@/providers/auth-provider";
import { useRealtime } from "@/providers/realtime-provider";
import {
  bulkUpdateNotifications,
  listNotifications,
  patchNotification,
  type InAppNotification
} from "@/services/userService";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Archive, Bell, CheckCircle2, ListFilter, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type FilterType = "all" | "unread" | "archived" | "prices" | "budgets" | "submissions" | "system";

export default function NotificationsPage() {
  const { accessToken, status } = useAuth();
  const { eventVersion } = useRealtime();
  
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (pageNum: number, currentFilter: FilterType, isInitial: boolean = false) => {
    if (!accessToken) return;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      let is_read = undefined;
      let is_archived = currentFilter === "archived" ? true : false;

      if (currentFilter === "unread") is_read = false;
      
      const res = await listNotifications(accessToken, {
        page: pageNum,
        is_read,
        is_archived: currentFilter === "archived" ? undefined : false,
      });
      
      let newItems = res.results;
      if (currentFilter === "archived") {
          newItems = newItems.filter(n => n.is_archived);
      } else {
          newItems = newItems.filter(n => !n.is_archived);
      }

      if (currentFilter === "prices") newItems = newItems.filter(n => n.type.includes('price'));
      else if (currentFilter === "budgets") newItems = newItems.filter(n => n.type.includes('budget'));
      else if (currentFilter === "submissions") newItems = newItems.filter(n => n.type === 'submission_status');
      else if (currentFilter === "system") newItems = newItems.filter(n => !n.type.includes('price') && !n.type.includes('budget') && n.type !== 'submission_status');

      if (isInitial) {
        setItems(newItems);
      } else {
        setItems(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewItems = newItems.filter(n => !existingIds.has(n.id));
          return [...prev, ...uniqueNewItems];
        });
      }
      
      setHasMore(!!res.next);
    } catch (err) {
      console.error("Failed to load notifications", err);
      toast.error("Failed to load notifications");
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated" && accessToken) {
      setPage(1);
      setHasMore(true);
      void fetchNotifications(1, filter, true);
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [status, accessToken, filter, eventVersion, fetchNotifications]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          void fetchNotifications(nextPage, filter, false);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, fetchNotifications, filter]);

  const handleMarkRead = async (id: number) => {
    if (!accessToken) return;
    try {
      await patchNotification(accessToken, id, { is_read: true });
      setItems(items.map(i => i.id === id ? { ...i, is_read: true } : i));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const handleArchive = async (id: number) => {
    if (!accessToken) return;
    try {
      await patchNotification(accessToken, id, { is_archived: true });
      setItems(items.filter(i => i.id !== id));
      toast.success("Notification archived");
    } catch (err) {
      toast.error("Failed to archive notification");
    }
  };

  const handleBulkMarkAllRead = async () => {
    if (!accessToken) return;
    const unreadIds = items.filter(i => !i.is_read).map(i => i.id);
    if (unreadIds.length === 0) return;
    
    try {
      await bulkUpdateNotifications(accessToken, "mark_read", unreadIds);
      setItems(items.map(i => ({ ...i, is_read: true })));
      toast.success("All visible notifications marked as read");
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const handleBulkArchiveAll = async () => {
    if (!accessToken) return;
    const ids = items.map(i => i.id);
    if (ids.length === 0) return;
    
    try {
      await bulkUpdateNotifications(accessToken, "archive", ids);
      setItems([]);
      toast.success("All visible notifications archived");
    } catch (err) {
      toast.error("Failed to archive notifications");
    }
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, InAppNotification[]> = {
      "Today": [],
      "Yesterday": [],
      "This Week": [],
      "Earlier": []
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    items.forEach(n => {
      const d = new Date(n.created_at);
      if (d >= startOfToday) groups["Today"].push(n);
      else if (d >= startOfYesterday) groups["Yesterday"].push(n);
      else if (d >= startOfWeek) groups["This Week"].push(n);
      else groups["Earlier"].push(n);
    });

    return groups;
  }, [items]);

  const isLoadingInitial = status === "loading" || (loading && page === 1);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your alerts and updates.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {items.some(i => !i.is_read) && filter !== "archived" && (
            <Button variant="outline" size="sm" onClick={handleBulkMarkAllRead}>
              <CheckCircle2 className="mr-2 size-4" />
              Mark all read
            </Button>
          )}
          {items.length > 0 && filter !== "archived" && (
            <Button variant="outline" size="sm" onClick={handleBulkArchiveAll}>
              <Archive className="mr-2 size-4" />
              Archive all
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-4 dark:border-slate-800">
        <Button 
          variant={filter === "all" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setFilter("all")}
          className="rounded-full"
        >
          All
        </Button>
        <Button 
          variant={filter === "unread" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setFilter("unread")}
          className="rounded-full"
        >
          Unread
        </Button>
        <Button 
          variant={filter === "archived" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setFilter("archived")}
          className="rounded-full"
        >
          Archived
        </Button>

        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ListFilter className="size-4" />
                Category
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>All Categories</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("prices")}>Prices</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("budgets")}>Budgets</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("submissions")}>Submissions</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notification List */}
      {isLoadingInitial ? (
        <NotificationsListSkeleton />
      ) : items.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Bell className="size-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No notifications yet</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400 max-w-sm">
            You're all caught up! Check back later for updates on your prices, budgets, and submissions.
          </p>
          <Button asChild className="mt-6">
            <Link href="/market">Browse Marketplace</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([groupName, groupItems]) => {
            if (groupItems.length === 0) return null;
            return (
              <div key={groupName} className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">{groupName}</h3>
                <div className="space-y-3">
                  {groupItems.map((n) => (
                    <div
                      key={n.id}
                      className={`group relative flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm ${
                        n.is_read 
                          ? "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950" 
                          : "border-l-4 border-l-primary border-y-slate-200 border-r-slate-200 bg-primary/5 dark:border-y-slate-800 dark:border-r-slate-800"
                      }`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize text-xs font-medium dark:bg-slate-900">
                            {n.type.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-sm ${!n.is_read ? "font-medium text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}`}>
                          {n.message}
                        </p>
                        
                        {/* Display Metadata Actions if available */}
                        {n.metadata?.url && (
                          <div className="pt-2">
                            <Button asChild variant="link" size="sm" className="h-auto p-0 text-primary">
                              <Link href={n.metadata.url}>View Details</Link>
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:opacity-0 transition-opacity group-hover:opacity-100">
                        {!n.is_read && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMarkRead(n.id)}
                            title="Mark as read"
                            className="size-8 rounded-full text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                          >
                            <CheckCircle2 className="size-4" />
                            <span className="sr-only">Mark read</span>
                          </Button>
                        )}
                        {filter !== "archived" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleArchive(n.id)}
                            title="Archive"
                            className="size-8 rounded-full text-slate-500 hover:text-destructive dark:text-slate-400 dark:hover:text-destructive"
                          >
                            <Archive className="size-4" />
                            <span className="sr-only">Archive</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Intersection Observer Target */}
          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-4">
              {loadingMore && <Loader2 className="size-5 animate-spin text-slate-400" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
