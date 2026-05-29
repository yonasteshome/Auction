export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getCart } from "@/actions/ecommerce";
import { AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { BudgetRecord, BudgetSummary } from "@/types/finance";
import { CartClient } from "./cart-client";
import { Card, CardContent } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

// ─── loading skeleton (also used by Suspense fallback) ─────────────────────
function CartSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-8 animate-pulse">
      <div className="col-span-12 lg:col-span-8 space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex gap-5">
              <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3 pt-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <aside className="col-span-12 lg:col-span-4 space-y-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </aside>
    </div>
  );
}

function getDisplayError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong while loading your cart.";
}

function CartLoadError({ message }: { message: string }) {
  return (
    <Card className="mb-6 border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-destructive">
            We could not load everything on this cart page.
          </p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── data fetcher (runs on server) ────────────────────────────────────────
async function CartData() {
  const [cartRes, budgetRes] = await Promise.allSettled([
    getCart(),
    apiClient<BudgetRecord[]>({ method: "GET", endpoint: "/api/finance/budgets/" }),
  ]);

  const items = cartRes.status === "fulfilled" ? cartRes.value.items : [];
  const cartError =
    cartRes.status === "rejected" ? getDisplayError(cartRes.reason) : null;
  const budgetError =
    budgetRes.status === "rejected" ? getDisplayError(budgetRes.reason) : null;

  let budget: BudgetRecord | null = null;
  let summary: BudgetSummary | null = null;

  if (budgetRes.status === "fulfilled") {
    const raw = budgetRes.value;
    const list: BudgetRecord[] = Array.isArray(raw)
      ? raw
      : ((raw as unknown as { results: BudgetRecord[] })?.results ?? []);

    if (list.length > 0) {
      budget = list[0];
      try {
        summary = await apiClient<BudgetSummary>({
          method: "GET",
          endpoint: `/api/finance/budgets/${budget.id}/summary/`,
        });
      } catch {
        // summary is optional — budget bar will still show without it
      }
    }
  }

  return (
    <>
      {cartError && <CartLoadError message={cartError} />}
      {!cartError && budgetError && (
        <CartLoadError message={`Budget details are unavailable: ${budgetError}`} />
      )}
      <CartClient
        initialItems={items}
        budget={budget}
        summary={summary}
        initialError={cartError}
      />
    </>
  );
}

// ─── page (Server Component) ───────────────────────────────────────────────
export default function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Shopping Cart</h1>
        <nav className="flex items-center text-sm text-muted-foreground gap-2">
          <a href="/vendors" className="hover:text-primary">Market</a>
          <span>/</span>
          <span className="text-foreground font-medium">Cart</span>
        </nav>
      </div>

      {/* Data fetched server-side; Suspense shows skeleton while streaming */}
      <Suspense fallback={<CartSkeleton />}>
        <CartData />
      </Suspense>
    </div>
  );
}
