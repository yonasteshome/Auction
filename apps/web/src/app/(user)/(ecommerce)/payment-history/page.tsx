export const dynamic = "force-dynamic";

import { apiClient } from "@/lib/api";
import { type ExpenseRecord } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { CreditCard, CalendarDays, CheckCircle2, History } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Payment History | MarketSight",
};

export default async function PaymentHistoryPage() {
  let expenses: ExpenseRecord[] = [];
  try {
    const res = await apiClient<{ results: ExpenseRecord[] } | ExpenseRecord[]>({
      method: "GET",
      endpoint: "/api/finance/expenses/",
      next: { revalidate: 60, tags: ["expenses"] },
    });
		
    // the backend may return paginated or direct array depending on implementation
    if (Array.isArray(res)) {
      expenses = res;
    } else if (res && Array.isArray(res.results)) {
      expenses = res.results;
    }
  } catch (err) {
    console.error("Failed to fetch expenses", err);
  }

  // Filter for those that come from Chapa (often auto-recorded via webhook)
  // or generally show all payments. We will emphasize chapa payments.
  const payments = expenses.filter(e => e.payment_method?.toLowerCase() === "chapa" || e.description?.includes("Chapa") || e.description?.includes("payment"));

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <History className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground text-sm">Review your past direct payments made via Chapa.</p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium">No payment history found</p>
              <p className="text-sm text-muted-foreground">Payments you make via Chapa will appear here.</p>
            </div>
          ) : (
            <div className="divide-y text-sm">
              {payments.map(payment => (
                <div key={payment.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-base mb-0.5">Payment for {payment.category || "Vendor"}</p>
                      <div className="flex items-center gap-3 text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {format(new Date(payment.date), "MMM d, yyyy h:mm a")}
                        </span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium capitalize">
                          {payment.payment_method || "Chapa"}
                        </span>
                      </div>
                      {payment.description && (
                        <p className="text-muted-foreground mt-2 text-xs italic border-l-2 pl-2">
                          {payment.description.length > 80 ? payment.description.substring(0, 80) + '...' : payment.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="font-bold text-lg">ETB {parseFloat(payment.amount).toLocaleString()}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium text-xs mt-1">Completed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
