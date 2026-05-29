"use client";

import { useTransition } from "react";
import { deletePriceAlert } from "@/actions/price-alerts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Trash2, Loader2, Clock, Mail, MessageSquare, BellRing } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";

interface PriceAlertData {
  id: number;
  item: number;
  item_name?: string;
  target_price: string;
  city?: string;
  alert_methods?: string[];
  expiry_days?: number;
  is_active: boolean;
  triggered_at?: string | null;
  created_at: string;
  expires_at?: string;
}

interface PriceAlertCardProps {
  alert: PriceAlertData;
  isExpired?: boolean;
}

const METHOD_ICONS: Record<string, React.ElementType> = {
  "in-app": BellRing,
  email: Mail,
  sms: MessageSquare,
};

export function PriceAlertCard({ alert, isExpired = false }: PriceAlertCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePriceAlert(String(alert.id));
      if (result.success) {
        toast.success("Price alert removed.");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to remove alert");
      }
    });
  };

  const expiresAt = alert.expires_at ? new Date(alert.expires_at) : null;
  const createdAt = new Date(alert.created_at);
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div
      className={`relative flex items-start gap-4 p-4 rounded-2xl border bg-card transition-all shadow-sm ${
        isExpired
          ? "border-border/50 bg-muted/30"
          : "border-blue-100 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800"
      }`}
    >
      {/* Icon */}
      <div
        className={`p-2.5 rounded-xl shrink-0 ${
          isExpired
            ? "bg-muted text-muted-foreground"
            : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        }`}
      >
        {isExpired ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <Link
              href={`/market/${alert.item}`}
              className="font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {alert.item_name ? alert.item_name : `Item #${alert.item}`}
            </Link>
            {alert.city && (
              <span className="ml-2 text-xs text-muted-foreground">· {alert.city}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isExpired ? (
              <Badge variant="secondary" className="text-[10px] font-semibold bg-muted text-muted-foreground border-none">
                Expired
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-none">
                Active
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
            {parseFloat(alert.target_price).toLocaleString("en-ET")} ETB
          </span>
          <span className="text-xs text-muted-foreground">target price</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Notify methods */}
          {alert.alert_methods && alert.alert_methods.length > 0 && (
            <div className="flex items-center gap-1.5">
              {alert.alert_methods.map((method) => {
                const Icon = METHOD_ICONS[method] ?? Bell;
                return (
                  <span
                    key={method}
                    className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                  >
                    <Icon className="w-3 h-3" />
                    {method}
                  </span>
                );
              })}
            </div>
          )}

          {/* Expiry info */}
          {daysLeft !== null && !isExpired && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {daysLeft === 0 ? "Expires today" : `${daysLeft}d left`}
            </span>
          )}

          {isExpired && expiresAt && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Expired {expiresAt.toLocaleDateString("en-ET")}
            </span>
          )}

          <span className="text-xs text-muted-foreground ml-auto">
            Set {createdAt.toLocaleDateString("en-ET")}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isPending}
        className="shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 w-8"
        title="Remove alert"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
