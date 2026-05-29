import { getUserPriceAlerts } from "@/actions/price-alerts";
import { Bell, AlertTriangle, CheckCircle2, Clock, Package } from "lucide-react";
import { PriceAlertCard } from "@/components/product-detail/price-alert-card";
import Link from "next/link";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Price Alerts | SpendSense Ethiopia",
  description: "Manage your price alert subscriptions and get notified when prices drop.",
};

export default async function PriceAlertsPage() {
  const result = await getUserPriceAlerts();

  const alerts = result.success ? result.data : [];

  const now = new Date();
  const activeAlerts = alerts.filter((a) => {
    if (!a.is_active) return false;
    if (a.expires_at && new Date(a.expires_at) < now) return false;
    return true;
  });
  const expiredAlerts = alerts.filter((a) => {
    if (!a.is_active) return true;
    if (a.expires_at && new Date(a.expires_at) < now) return true;
    return false;
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Price Alerts</h1>
          <p className="text-muted-foreground text-sm">
            Get notified when tracked item prices drop to your target.
          </p>
        </div>
      </div>

      {!result.success && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {result.message}
        </div>
      )}

      {alerts.length === 0 && result.success && (
        <div className="flex flex-col items-center justify-center py-20 gap-5 border border-dashed rounded-2xl bg-card text-center">
          <div className="p-5 bg-muted rounded-full">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-lg">No price alerts yet</p>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
              Browse market items and set alerts to get notified when prices drop.
            </p>
          </div>
          <Link
            href="/market"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Browse Market
          </Link>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Active Alerts ({activeAlerts.length})
          </div>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <PriceAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      )}

      {expiredAlerts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Clock className="w-4 h-4" />
            Expired / Inactive Alerts ({expiredAlerts.length})
          </div>
          <div className="space-y-3 opacity-70">
            {expiredAlerts.map((alert) => (
              <PriceAlertCard key={alert.id} alert={alert} isExpired />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
