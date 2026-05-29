"use client";

import React, { useTransition } from "react";
import { useState } from "react";
import { Eye, Loader2, X, Package, Calendar, Building2, CreditCard, Hash, Clock } from "lucide-react";
import { getOrderById } from "@/actions/ecommerce";
import type { Purchase } from "@/lib/ecommerce-types";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { toast } from "sonner";

interface OrderDetailButtonProps {
  orderId: string;
}

function formatCurrency(amount: number | string) {
  const num = typeof amount === "string" ? parseFloat(String(amount).replace(/[^0-9.-]/g, "")) : amount;
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 2,
  }).format(isFinite(num) ? num : 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StatusBadge({ status }: { status: Purchase["status"] }) {
  const map: Record<string, { label: string; color: string }> = {
    delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
    paid: { label: "Paid", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    shipped: { label: "Shipped", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400" },
    pending: { label: "Pending", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    failed: { label: "Failed", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  };
  const info = map[status] ?? { label: status, color: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${info.color}`}>
      {info.label}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="p-2 rounded-lg bg-muted shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="text-sm font-semibold mt-0.5 break-all">{value}</div>
      </div>
    </div>
  );
}

export function OrderDetailButton({ orderId }: OrderDetailButtonProps) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<Purchase | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setOpen(true);
    if (!order) {
      startTransition(async () => {
        try {
          const data = await getOrderById(orderId);
          setOrder(data);
        } catch {
          toast.error("Failed to load order details.");
          setOpen(false);
        }
      });
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleOpen}
        aria-label="View order details"
      >
        <Eye size={16} className="text-muted-foreground hover:text-primary" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative bg-background rounded-2xl shadow-2xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b bg-background/95 backdrop-blur">
              <div>
                <h2 className="text-lg font-bold">Order Details</h2>
                {order && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    #{order.reference || order.id.slice(0, 8)}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-5">
              {isPending && !order ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading order…</p>
                </div>
              ) : order ? (
                <div className="space-y-1">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={order.status} />
                    <span className="text-2xl font-extrabold text-foreground">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>

                  <DetailRow icon={Hash} label="Reference" value={order.reference || "—"} />
                  <DetailRow icon={Building2} label="Vendor" value={order.vendor_name || "Unknown Vendor"} />
                  <DetailRow icon={Package} label="Items / Qty" value={`${order.quantity} unit(s)`} />
                  <DetailRow icon={CreditCard} label="Payment Method" value={order.payment_method || "—"} />
                  <DetailRow
                    icon={CreditCard}
                    label="Payment Reference"
                    value={order.payment_reference || "—"}
                  />
                  <DetailRow icon={Calendar} label="Order Date" value={formatDate(order.created_at)} />
                  <DetailRow icon={Clock} label="Paid At" value={formatDate(order.paid_at)} />
                  <DetailRow icon={Calendar} label="Last Updated" value={formatDate(order.updated_at)} />

                  {/* {order.payment_url && (
                    <div className="pt-4">
                      <a
                        href={order.payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                      >
                        Pay Now
                      </a>
                    </div>
                  )} */}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
