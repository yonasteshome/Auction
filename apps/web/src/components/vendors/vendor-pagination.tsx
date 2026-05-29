"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface VendorPaginationProps {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function VendorPagination({ total, page, pageSize, totalPages }: VendorPaginationProps) {
  const [isPending, startTransition] = useTransition();
  const [, setPageParam] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ shallow: false }));

  const startResult = (page - 1) * pageSize + 1;
  const endResult = Math.min(page * pageSize, total);

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
      <div className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
        Showing <span className="font-medium text-foreground">{startResult}</span> to <span className="font-medium text-foreground">{endResult}</span> of <span className="font-medium text-foreground">{total}</span> results
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => { setPageParam(page > 1 ? page - 1 : null); })}
          disabled={page <= 1 || isPending}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            // Simplified pagination windowing (for 21+ pages you'd want ellipsis, but usually fine for now)
            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
              return (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className={`w-9 h-9 p-0 ${p === page ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                  onClick={() => startTransition(() => { setPageParam(p === 1 ? null : p); })}
                  disabled={isPending || p === page}
                >
                  {p}
                </Button>
              );
            }
            if (p === page - 2 || p === page + 2) {
              return <span key={p} className="text-muted-foreground px-1">...</span>;
            }
            return null;
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => { setPageParam(page < totalPages ? page + 1 : null); })}
          disabled={page >= totalPages || isPending}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
