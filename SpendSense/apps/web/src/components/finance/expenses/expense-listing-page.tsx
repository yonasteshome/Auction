"use client";

import { AlertCircle, Loader2 } from "lucide-react";

import { ExpensesHeader } from "@/components/finance/expenses/expenses-header";
import { ExpensesSummaryCards } from "@/components/finance/expenses/expenses-summary-cards";
import { ExpensesFilters } from "@/components/finance/expenses/expenses-filters";
import { ExpensesTable } from "@/components/finance/expenses/expenses-table";
import { useExpenseListing } from "@/hooks/use-expense-listing";
import { useAuth } from "@/providers/auth-provider";
import { downloadFinanceExport } from "@/services/financeService";

export function ExpenseListingPage({ initial }: { initial?: { expenses?: import("@/types/finance").ExpenseRecord[]; budgets?: import("@/types/finance").BudgetRecord[] } }) {
  const { accessToken } = useAuth();
  const {
    status,
    loading,
    error,
    summary,
    categories,
    categoryFilter,
    sortBy,
    expenses,
    setCategoryFilter,
    setSortBy,
  } = useExpenseListing(initial);

  const exportCsv = async () => {
    if (!accessToken) return;
    try {
      await downloadFinanceExport(accessToken, "csv");
    } catch {
      // ignored; could toast
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading expenses...
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-0 pb-8">
      <ExpensesHeader onExportCsv={exportCsv} />
      <ExpensesSummaryCards summary={summary} />

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      <ExpensesFilters
        categories={categories}
        categoryFilter={categoryFilter}
        sortBy={sortBy}
        onCategoryChange={setCategoryFilter}
        onSortChange={setSortBy}
      />

      <ExpensesTable
        expenses={expenses}
      />
    </div>
  );
}
