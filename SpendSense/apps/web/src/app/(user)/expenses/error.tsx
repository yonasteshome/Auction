"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export default function ExpensesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Expenses Page Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertCircle className="size-10" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900">Something went wrong</h2>
      <p className="mb-8 max-w-md text-slate-500">
        We encountered an error while trying to load your expenses. {error.message || "Please try again."}
      </p>
      <Button 
        onClick={() => reset()} 
        variant="default" 
        className="gap-2"
      >
        <RefreshCcw className="size-4" />
        Try Again
      </Button>
    </div>
  );
}
