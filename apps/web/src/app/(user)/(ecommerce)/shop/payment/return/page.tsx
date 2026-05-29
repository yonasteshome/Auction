"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { getOrders, removeBulkFromCart } from "@/actions/ecommerce";

type PendingCheckout = {
  listingIds: number[];
  references: string[];
};

function parseNumberList(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function parseStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readPendingCheckout(): PendingCheckout {
  const pending = sessionStorage.getItem("pending_checkout");
  if (pending) {
    try {
      const parsed = JSON.parse(pending) as Record<string, unknown>;
      return {
        listingIds: parseNumberList(parsed.listingIds),
        references: parseStringList(parsed.references),
      };
    } catch (error) {
      console.error("Failed to parse pending checkout:", error);
    }
  }

  const legacyPending = sessionStorage.getItem("pending_checkout_listings");
  if (!legacyPending) {
    return { listingIds: [], references: [] };
  }

  try {
    return {
      listingIds: parseNumberList(JSON.parse(legacyPending)),
      references: [],
    };
  } catch (error) {
    console.error("Failed to parse pending checkout listings:", error);
    return { listingIds: [], references: [] };
  }
}

function clearPendingCheckout(): void {
  sessionStorage.removeItem("pending_checkout");
  sessionStorage.removeItem("pending_checkout_listings");
}

function hasSuccessfulReturnStatus(searchParams: Pick<URLSearchParams, "get">): boolean {
  const status = (
    searchParams.get("status") ||
    searchParams.get("payment_status") ||
    searchParams.get("transaction_status") ||
    ""
  ).toLowerCase();

  return status === "success" || status === "paid" || status === "completed";
}

function PaymentReturnInner() {
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchase_id") || searchParams.get("id");

  useEffect(() => {
    const pending = readPendingCheckout();
    console.log('[PaymentReturn] pending checkout read:', pending);
    if (pending.listingIds.length === 0) {
      clearPendingCheckout();
      return;
    }

    async function clearCartAfterConfirmedPayment() {
      if (hasSuccessfulReturnStatus(searchParams)) {
        console.log('[PaymentReturn] return status indicates success — removing pending listings:', pending.listingIds);
        await removeBulkFromCart(pending.listingIds);
        clearPendingCheckout();
        return;
      }

      if (pending.references.length === 0) {
        return;
      }

      const ordersRes = await getOrders();
      const orders = ordersRes.results;
      console.log('[PaymentReturn] fetched user orders count=', orders.length);
      const pendingRefs = new Set(pending.references);
      const matchingOrders = orders.filter((order) => pendingRefs.has(order.reference));
      console.log('[PaymentReturn] matching orders for pending refs:', matchingOrders);
      const allPendingOrdersPaid =
        matchingOrders.length === pendingRefs.size &&
        matchingOrders.every((order) => order.status === "paid");

      if (allPendingOrdersPaid) {
        console.log('[PaymentReturn] all pending orders are paid — clearing cart for listings:', pending.listingIds);
        await removeBulkFromCart(pending.listingIds);
        clearPendingCheckout();
      }
    }

    clearCartAfterConfirmedPayment().catch(console.error);
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
      <h1 className="text-2xl font-bold">Payment return</h1>
      <p className="text-slate-600">
        {purchaseId
          ? `We are confirming your order (${purchaseId}). You can check status in orders.`
          : "If you completed payment, your order will appear under Orders shortly."}
      </p>
      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link href="/orders">View orders</Link>
        </Button>
        {/* <Button variant="outline" asChild>
          <Link href="/payment-history">View payment history</Link>
        </Button> */}
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={<div className="text-center text-slate-500">Loading…</div>}
    >
      <PaymentReturnInner />
    </Suspense>
  );
}
