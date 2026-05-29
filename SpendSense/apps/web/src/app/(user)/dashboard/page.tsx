export const dynamic = "force-dynamic";

import { markNotificationRead } from "@/actions/notifications";
import { MonthlySpendingChart } from "@/components/dashboard/monthly-spending-chart";
import { getUserDashboard } from "@/services/dashboardService";
import { Button } from "@repo/ui/components/button";
import { Bell, ShoppingBasket, TrendingUp } from "lucide-react";
import Link from "next/link";

function formatEtb(value: string | number | null | undefined) {
  const amount = typeof value === "string" ? Number.parseFloat(value || "0") : Number(value ?? 0);
  return `${Number.isFinite(amount) ? amount.toLocaleString("en-ET", { maximumFractionDigits: 0 }) : "0"} ETB`;
}

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString("en-ET", { month: "short", day: "numeric" }) : "";
}

export default async function UsersPage() {
  const dashboard = await getUserDashboard().catch(() => null);
  const user = dashboard?.user ?? null;
  const overview = dashboard?.overview;
  const currentBudget = dashboard?.current_budget;
  const categorySpending = currentBudget?.by_category ?? dashboard?.category_spending ?? [];
  const monthlyTrend = dashboard?.monthly_trend ?? [];
  const notifications = dashboard?.notifications ?? [];
  const recentExpenses = dashboard?.recent_expenses ?? [];
  const currentName = user?.full_name?.split(" ")?.[0] ?? "Abebe";
  const unreadCount = overview?.unread_notifications ?? 0;
  const budgetUsed = currentBudget?.percent_total_used ?? overview?.percent_used ?? 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full">
        <main className="w-full flex-1">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Welcome, {currentName}
                </h2>
                <p className="text-muted-foreground">
                  Your live budget, spending, and notifications from the backend.
                </p>
                {user?.city ? <p className="text-sm text-muted-foreground">Based in {user.city}</p> : null}
              </div>
              <Button asChild>
                <Link href="/dashboard/budget">Add Expense</Link>
              </Button>
            </header>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Total Monthly Spending</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-2xl font-bold tracking-tight">{formatEtb(overview?.monthly_spent)}</p>
                  {overview && Number.parseFloat(overview.budget_limit) > 0 ? (
                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      of {formatEtb(overview.budget_limit)} budget
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Remaining in budget</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-2xl font-bold tracking-tight">{formatEtb(overview?.remaining)}</p>
                  {overview && Number.parseFloat(overview.budget_limit) === 0 ? (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                      Set a budget
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Daily average (this month)</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-bold tracking-tight">{formatEtb(overview?.daily_average)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Unread notifications</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-bold tracking-tight">{unreadCount}</p>
                </div>
              </div>
            </section>

            <section>
              <MonthlySpendingChart
                data={monthlyTrend}
                monthlySpent={overview?.monthly_spent ?? currentBudget?.total_spent}
                dailyAverage={overview?.daily_average}
              />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold">Monthly Budget Usage</h3>
                      <p className="text-sm text-muted-foreground">
                        Live totals from your latest budget and expenses.
                      </p>
                    </div>
                    <span className="text-lg font-bold">{Math.min(100, Math.max(0, Math.round(budgetUsed)))}%</span>
                  </div>
                  <div className="mt-4 h-3 w-full rounded-full bg-muted">
                    <div
                      className="h-3 rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, Math.round(budgetUsed)))}%` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatEtb(currentBudget?.total_spent ?? overview?.monthly_spent)} Spent
                    </span>
                    <span className="font-semibold">
                      {formatEtb(currentBudget?.remaining ?? overview?.remaining)} left
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold">Category Breakdown</h3>
                      <p className="text-sm text-muted-foreground">Budget allocation versus actual spending.</p>
                    </div>
                  </div>

                  {categorySpending.length === 0 ? (
                    <p className="mt-6 text-sm text-muted-foreground">
                      No budget categories yet. Create a budget to see category-level progress here.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {categorySpending.map((category) => {
                        const percent = Math.min(100, Math.max(0, Math.round(category.percent_used)));
                        return (
                          <div key={category.category_name} className="space-y-2">
                            <div className="flex items-center justify-between gap-4 text-sm">
                              <span className="font-medium">{category.category_name}</span>
                              <span className="text-muted-foreground">
                                {formatEtb(category.spent)} / {formatEtb(category.limit_amount)}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  category.warning_100 ? "bg-destructive" : category.warning_80 ? "bg-amber-500" : "bg-primary"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold">Recent Expenses</h3>
                      <p className="text-sm text-muted-foreground">Latest transactions saved in the backend.</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{overview?.expense_count ?? 0} total</span>
                  </div>

                  {recentExpenses.length === 0 ? (
                    <p className="mt-6 text-sm text-muted-foreground">
                      No expenses recorded yet. Add your first expense to populate this list.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {recentExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
                          <div>
                            <p className="font-medium">{expense.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {expense.description || expense.payment_method || "Expense logged"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{formatDate(expense.date)}</p>
                          </div>
                          <p className="text-base font-semibold">{formatEtb(expense.amount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h3 className="text-base font-bold">Notifications</h3>
                  <Button variant="link" asChild className="h-auto p-0 text-sm">
                    <Link href="/notifications">
                      View all{unreadCount ? ` (${unreadCount} new)` : ""}
                    </Link>
                  </Button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No notifications yet. Spending and market alerts will appear here.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        {index > 0 ? <hr className="mb-5 border-border/60" /> : null}
                        <form action={markNotificationRead} className="w-full">
                          <button name="id" value={String(notification.id)} type="submit" className="w-full text-left">
                            <div className="flex gap-4">
                              <div
                                className={`flex size-10 items-center justify-center rounded-full ${
                                  notification.type?.includes("price") || notification.type?.includes("market")
                                    ? "bg-rose-50 text-rose-600"
                                    : notification.type?.includes("budget")
                                      ? "bg-primary/10 text-primary"
                                      : "bg-emerald-50 text-emerald-600"
                                }`}
                              >
                                {notification.type?.includes("price") || notification.type?.includes("market") ? (
                                  <TrendingUp className="size-5" />
                                ) : notification.type?.includes("budget") ? (
                                  <Bell className="size-5" />
                                ) : (
                                  <ShoppingBasket className="size-5" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold capitalize">
                                  {notification.type?.replaceAll("_", " ") ?? "Update"}
                                </p>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {formatDate(notification.created_at)}
                                </p>
                              </div>
                              {!notification.is_read ? (
                                <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                              ) : null}
                            </div>
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
