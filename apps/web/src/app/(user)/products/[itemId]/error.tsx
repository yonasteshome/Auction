"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong!</h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
        We encountered an error while trying to load the product details. Please try again or return to the dashboard.
      </p>
      <div className="flex items-center gap-4">
        <Button onClick={() => reset()} className="gap-2 bg-[#135bec] hover:bg-[#0d4fd4] text-white">
          <RefreshCcw className="w-4 h-4" /> Try again
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/">
            <Home className="w-4 h-4" /> Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
