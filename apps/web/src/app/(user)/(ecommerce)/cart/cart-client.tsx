"use client";

import { useState, useTransition } from "react";
import {
  ShoppingCart, Trash2, Minus, Plus, Lightbulb,
  TrendingDown, ShieldCheck, HeadphonesIcon, AlertTriangle,
  CheckCircle2, PiggyBank, TrendingUp, Package, Tag, Loader2,
  XCircle, RefreshCw, X,
} from "lucide-react";
import { addToCart, bulkCheckout, removeBulkFromCart } from "@/actions/ecommerce";
import type { CartItem } from "@/lib/ecommerce-types";
import type { BudgetRecord, BudgetSummary, BudgetSummaryCategory } from "@/types/finance";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Separator } from "@repo/ui/components/separator";
import { Card, CardContent } from "@repo/ui/components/card";
import { toast } from "sonner";
import Link from "next/link";

// ─── constants ─────────────────────────────────────────────────────────────
const DELIVERY_FEE = 50;

// ─── helpers ───────────────────────────────────────────────────────────────
function groupByVendor(items: CartItem[]): Map<string, CartItem[]> {
  const map = new Map<string, CartItem[]>();
  for (const item of items) {
    const g = map.get(item.vendor_id) ?? [];
    g.push(item);
    map.set(item.vendor_id, g);
  }
  return map;
}

// ─── sub-components ────────────────────────────────────────────────────────
function PriceChangeBadge({ pct }: { pct: number }) {
  if (Math.abs(pct) < 1) return null;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
      up ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
         : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    }`}>
      {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {up ? "+" : ""}{pct.toFixed(1)}% vs when added
    </span>
  );
}

function BudgetWarning({ pct, label }: { pct: number; label: string }) {
  if (pct < 80) return null;
  const over = pct >= 100;
  return (
    <div className={`flex items-start gap-2 rounded-lg p-2.5 text-xs ${
      over
        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40"
        : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
    }`}>
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>
        <strong>{label}</strong> {over ? "will exceed" : "will reach"} {pct.toFixed(0)}% of budget
      </span>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={bold ? "font-bold" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-extrabold text-primary" : "font-bold"}>{value}</span>
    </div>
  );
}

// ─── checkout error banner ──────────────────────────────────────────────────
interface CheckoutErrorBannerProps {
  message: string;
  onDismiss: () => void;
  onRetry: () => void;
  isRetrying: boolean;
}

function CheckoutErrorBanner({ message, onDismiss, onRetry, isRetrying }: CheckoutErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive space-y-2"
    >
      <div className="flex items-start gap-2">
        <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <p className="flex-1 leading-snug">{message}</p>
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="shrink-0 text-destructive/60 hover:text-destructive transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-1.5 text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50 pl-6"
      >
        <RefreshCw className={`size-3 ${isRetrying ? "animate-spin" : ""}`} />
        {isRetrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

// ─── props ─────────────────────────────────────────────────────────────────
interface CartClientProps {
  initialItems: CartItem[];
  budget: BudgetRecord | null;
  summary: BudgetSummary | null;
  initialError?: string | null;
}

// ─── main client component ─────────────────────────────────────────────────
export function CartClient({ initialItems, budget, summary, initialError = null }: CartClientProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [checkoutError, setCheckoutError] = useState<string | null>(initialError);
  const [selectedListingIds, setSelectedListingIds] = useState<Set<number>>(
    new Set(initialItems.map((i) => i.listing_id))
  );
  const [isCheckingOut, startCheckout] = useTransition();
  const [, startTransition] = useTransition();

  // ── derived values (computed early so handleBulkCheckout can reference) ──
  const selectedItems = items.filter((i) => selectedListingIds.has(i.listing_id));

  // ── mutations ──────────────────────────────────────────────────────────

  const toggleSelection = (listingId: number) => {
    // Clear any stale checkout error when the user changes their selection
    if (checkoutError) setCheckoutError(null);

    setSelectedListingIds((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) next.delete(listingId);
      else next.add(listingId);
      return next;
    });
  };

  const handleBulkCheckout = () => {
    if (selectedListingIds.size === 0) {
      toast.warning("Please select at least one item to check out.");
      return;
    }

    startCheckout(async () => {
      setCheckoutError(null);

      try {
        const itemsToCheckout = items.filter((i) => selectedListingIds.has(i.listing_id));

        if (itemsToCheckout.length === 0) {
          const msg = "No items selected for checkout.";
          setCheckoutError(msg);
          toast.error(msg);
          return;
        }

        const payload = itemsToCheckout.map((i) => ({
          vendor_id: i.vendor_id,
          listing_id: i.listing_id,
          quantity: i.quantity,
        }));

        console.log("[Cart] Starting bulkCheckout with payload:", payload);

        const response = await bulkCheckout({ items: payload, payment_method: "chapa" });

        console.log("[Cart] bulkCheckout response:", response);

        // Find the payment URL from any of the returned purchases
        const checkoutUrl = response.find((p) => p.payment_url)?.payment_url;

        if (checkoutUrl) {
          // Persist which listings / references are pending so the callback
          // page can reconcile and clear them from the cart after confirmation
          try {
            sessionStorage.setItem(
              "pending_checkout",
              JSON.stringify({
                listingIds: Array.from(selectedListingIds),
                references: response.map((purchase) => purchase.reference),
              }),
            );
            console.log('[Cart] pending_checkout saved to sessionStorage:', sessionStorage.getItem('pending_checkout'));
          } catch (storageErr) {
            console.warn('[Cart] Could not save pending_checkout to sessionStorage:', storageErr);
          }

          // Attempt to remove items from cart (best-effort) before redirecting
          try {
            console.log('[Cart] Removing items from cart before redirect:', Array.from(selectedListingIds));
            await removeBulkFromCart(Array.from(selectedListingIds));
          } catch (rmErr) {
            console.warn('[Cart] removeBulkFromCart failed:', rmErr);
          }

          console.log('[Cart] Redirecting to Chapa payment URL:', checkoutUrl);
          window.location.href = checkoutUrl;
        } else {
          // The backend accepted the request but returned no payment URL —
          // this typically means Chapa initialisation failed on the server side.
          const noUrlMsg =
            "Payment gateway did not return a checkout URL. " +
            "Please try again or contact support if the problem persists.";

          console.error(
            "[Cart] bulkCheckout succeeded but no payment_url was found in response:",
            response,
          );

          setCheckoutError(noUrlMsg);
          toast.error(noUrlMsg);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Payment could not be started. Please try again.";

        console.error("[Cart] bulkCheckout threw an error:", error);

        setCheckoutError(message);
        toast.error(message);
      }
    });
  };

  const adjustQty = (item: CartItem, delta: number) => {
    const next = item.quantity + delta;

    if (next < 1) {
      removeItem(item.listing_id);
      return;
    }

    // Optimistic update — apply immediately so the UI feels instant
    setItems((prev) =>
      prev.map((i) =>
        i.listing_id === item.listing_id && i.vendor_id === item.vendor_id
          ? { ...i, quantity: next }
          : i,
      ),
    );

    // Sync increment with the server cookie (decrements are local-only
    // since the server cart tracks additions, not absolute quantities)
    if (delta > 0) {
      startTransition(async () => {
        try {
          console.log("[Cart] Syncing quantity increment for listing:", item.listing_id);

          const updated = await addToCart({
            listing_id: item.listing_id,
            vendor_id: item.vendor_id,
            vendor_name: item.vendor_name,
            item_name: item.item_name,
            unit: item.unit,
            quantity: delta,
            unit_price: item.unit_price,
          });

          setItems(updated.items);
          console.log("[Cart] Quantity synced successfully.");
        } catch (error) {
          console.error("[Cart] Failed to sync quantity for listing:", item.listing_id, error);

          toast.error("Failed to update quantity — please try again.");

          // Revert the optimistic update
          setItems((prev) =>
            prev.map((i) =>
              i.listing_id === item.listing_id && i.vendor_id === item.vendor_id
                ? { ...i, quantity: item.quantity }
                : i,
            ),
          );
        }
      });
    }
  };

  const removeItem = (listingId: number) => {
    try {
      setItems((prev) => prev.filter((i) => i.listing_id !== listingId));
      setSelectedListingIds((prev) => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
      // Also clear a stale checkout error that may have referenced this item
      if (checkoutError) setCheckoutError(null);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("[Cart] Unexpected error while removing item:", listingId, error);
      toast.error("Could not remove item. Please refresh the page and try again.");
    }
  };

  // ── derived values ─────────────────────────────────────────────────────

  const groups     = groupByVendor(selectedItems);
  const subtotal   = selectedItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const delivery   = groups.size * DELIVERY_FEE;
  const tax        = subtotal * 0.08;
  const grandTotal = subtotal + delivery + tax;

  // Budget impact
  const budgetTotal  = budget ? parseFloat(budget.total_limit) : 0;
  const currentSpent = summary ? parseFloat(summary.total_spent) : 0;
  const cartPct      = budgetTotal > 0 ? ((currentSpent + subtotal) / budgetTotal) * 100 : 0;
  const cartOnlyPct  = budgetTotal > 0 ? (subtotal / budgetTotal) * 100 : 0;

  type CategoryImpact = {
    name: string;
    pctAfter: number;
    cat: BudgetSummaryCategory;
  };

  const categoryImpact: CategoryImpact[] = summary?.by_category.map((cat) => {
    const catSpend = selectedItems
      .filter((i) =>
        i.item_name.toLowerCase().includes(cat.category_name.toLowerCase()) ||
        cat.category_name.toLowerCase().includes("food") ||
        cat.category_name.toLowerCase().includes("grocery")
      )
      .reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const currentCatSpent = parseFloat(cat.spent);
    const limit = parseFloat(cat.limit_amount);
    return {
      name: cat.category_name,
      pctAfter: limit > 0 ? ((currentCatSpent + catSpend) / limit) * 100 : 0,
      cat,
    };
  }) ?? [];

  // ── render ─────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* LEFT: Vendor-grouped items */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 flex flex-col items-center text-center gap-3">
              <Package className="w-12 h-12 text-muted-foreground/40" />
              <p className="font-semibold text-lg">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Browse vendors to add items.</p>
              <Button asChild className="mt-2">
                <Link href="/vendors">Browse Market</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          Array.from(groupByVendor(items).entries()).map(([vendorId, vendorItems]) => {
            const vendorSelected = vendorItems.filter((i) => selectedListingIds.has(i.listing_id));
            const vendorSubtotal = vendorSelected.reduce((s, i) => s + i.unit_price * i.quantity, 0);
            const vendorDelivery = vendorSelected.length > 0 ? DELIVERY_FEE : 0;
            const vendorName = vendorItems[0]?.vendor_name ?? `Vendor #${vendorId.slice(0, 8)}…`;
            const avatarLetter = vendorName.charAt(0).toUpperCase();

            return (
              <Card key={vendorId} className="border shadow-sm overflow-hidden">
                {/* Vendor header */}
                <div className="px-5 py-3 bg-muted/50 border-b flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {avatarLetter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{vendorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {vendorItems.length} item{vendorItems.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/vendors/${vendorId}`}
                    className="text-xs text-blue-600 hover:underline shrink-0"
                  >
                    View store →
                  </Link>
                </div>

                {/* Items */}
                <div className="divide-y">
                  {vendorItems.map((item) => (
                    <div key={item.listing_id} className="flex items-start gap-4 p-5">
                      <div className="pt-4">
                        <Checkbox
                          checked={selectedListingIds.has(item.listing_id)}
                          onCheckedChange={() => toggleSelection(item.listing_id)}
                          className="h-5 w-5"
                        />
                      </div>
                      {/* Image placeholder */}
                      <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 text-primary/30">
                        <ShoppingCart className="w-7 h-7" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-semibold text-sm leading-tight">{item.item_name}</p>
                            {item.vendor_name && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                {item.vendor_name}
                              </span>
                            )}
                            <p className="text-xs text-muted-foreground mt-1.5">
                              ETB {item.unit_price.toFixed(2)} / {item.unit ?? "unit"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-extrabold text-base">
                              ETB {(item.unit_price * item.quantity).toFixed(2)}
                            </p>
                            <PriceChangeBadge pct={0} />
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center bg-secondary rounded-lg overflow-hidden">
                            <button
                              onClick={() => adjustQty(item, -1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-background transition-colors active:scale-90"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="px-3 font-bold text-sm min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => adjustQty(item, 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-background transition-colors active:scale-90"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.listing_id)}
                            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vendor footer */}
                <div className="px-5 py-3 bg-muted/30 border-t flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                  <span className="text-muted-foreground">
                    Subtotal <span className="font-semibold text-foreground">ETB {vendorSubtotal.toFixed(2)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Delivery <span className="font-semibold text-foreground">ETB {vendorDelivery.toFixed(2)}</span>
                  </span>
                  <span className="ml-auto font-bold">
                    Vendor Total: ETB {(vendorSubtotal + vendorDelivery).toFixed(2)}
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* RIGHT: Order summary + budget */}
      <aside className="col-span-12 lg:col-span-4 space-y-5">

        {/* Order Summary */}
        <Card className="border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-extrabold text-base">Order Summary</h3>
          </div>
          <CardContent className="p-6 space-y-3">

            {/* ── checkout error banner ── */}
            {checkoutError && (
              <CheckoutErrorBanner
                message={checkoutError}
                onDismiss={() => setCheckoutError(null)}
                onRetry={handleBulkCheckout}
                isRetrying={isCheckingOut}
              />
            )}

            <SummaryRow
              label={`Subtotal (${selectedItems.length} of ${items.length} item${items.length !== 1 ? "s" : ""} selected)`}
              value={`ETB ${subtotal.toFixed(2)}`}
            />
            <SummaryRow
              label={`Delivery (${groups.size} vendor${groups.size !== 1 ? "s" : ""})`}
              value={`ETB ${delivery.toFixed(2)}`}
            />
            <SummaryRow label="Infrastructure Tax (8%)" value={`ETB ${tax.toFixed(2)}`} />
            <Separator className="border-dashed" />
            <SummaryRow label="Grand Total" value={`ETB ${grandTotal.toFixed(2)}`} bold />

            {/* ── no items selected warning ── */}
            {items.length > 0 && selectedItems.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20 p-2.5 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-3.5 shrink-0" />
                <span>Select at least one item to proceed.</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-3">
              <Button
                id="pay-with-chapa-btn"
                onClick={handleBulkCheckout}
                disabled={isCheckingOut || selectedItems.length === 0}
                className="w-full h-12 rounded-xl font-bold mt-2 shadow-md bg-[#2D3328] hover:bg-[#1f241a] text-white"
              >
                {isCheckingOut ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}…
                  </span>
                ) : (
                  `Pay with Chapa${selectedItems.length > 0 ? ` (${selectedItems.length})` : ""}`
                )}
              </Button>
              <Button
                variant="outline"
                disabled={selectedItems.length === 0}
                className="w-full h-12 rounded-xl font-bold border-2"
                onClick={() => toast.info("Order delivery will be implemented in the future")}
              >
                Order delivery
              </Button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold mt-2">
              Secure Payment · Chapa
            </p>
          </CardContent>
        </Card>

        {/* Budget Impact */}
        {(budget || items.length > 0) && (
          <Card className="border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm">Budget Impact</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {budget ? (
                <>
                  {/* Overall bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Monthly Budget</span>
                      <span className="font-semibold">{cartPct.toFixed(0)}% used after cart</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cartPct >= 100 ? "bg-red-500" : cartPct >= 80 ? "bg-amber-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(cartPct, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cart adds{" "}
                      <span className="font-semibold text-foreground">ETB {subtotal.toFixed(2)}</span>
                      {" "}({cartOnlyPct.toFixed(1)}% of your budget)
                    </p>
                  </div>

                  {/* Per-category bars */}
                  {categoryImpact.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        By Category
                      </p>
                      {categoryImpact.slice(0, 4).map((c) => (
                        <div key={c.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium truncate max-w-[130px]">{c.name}</span>
                            <span className={
                              c.pctAfter >= 100 ? "text-red-500 font-bold"
                              : c.pctAfter >= 80 ? "text-amber-500 font-bold"
                              : "text-muted-foreground"
                            }>
                              {c.pctAfter.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                c.pctAfter >= 100 ? "bg-red-500"
                                : c.pctAfter >= 80 ? "bg-amber-500"
                                : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(c.pctAfter, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warnings */}
                  <div className="space-y-2">
                    <BudgetWarning pct={cartPct} label="Total monthly budget" />
                    {categoryImpact
                      .filter((c) => c.pctAfter >= 80)
                      .map((c) => (
                        <BudgetWarning key={c.name} pct={c.pctAfter} label={c.name} />
                      ))}
                    {cartPct < 80 && (
                      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cart fits within your monthly budget
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <Tag className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">No budget set up yet.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/budget">Set up Budget</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SpendSense Tip */}
        <div className="relative overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <Lightbulb size={14} fill="currentColor" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">SpendSense Tip</span>
            </div>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              Bundling items per vendor reduces delivery costs. You could save up to{" "}
              <strong>ETB {(delivery * 0.4).toFixed(0)}</strong> by consolidating orders.
            </p>
          </div>
          <TrendingDown className="absolute -right-4 -bottom-4 h-28 w-28 opacity-10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
            <ShieldCheck className="text-primary shrink-0" size={16} />
            <span className="text-[10px] font-bold leading-tight">256-bit AES Encryption</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
            <HeadphonesIcon className="text-primary shrink-0" size={16} />
            <span className="text-[10px] font-bold leading-tight">24/7 Expert Support</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
