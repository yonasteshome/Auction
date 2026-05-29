"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  params: Record<string, string>;
}

export function ProductPaginationControls({
  page,
  totalPages,
  total,
  params,
}: ProductPaginationControlsProps) {
  const router = useRouter();

  const buildUrl = (nextPage: number) => {
    const next = new URLSearchParams({ ...params, page: String(nextPage) });
    return `/products?${next.toString()}`;
  };

  return (
    <div className="flex items-center justify-between mt-6 px-2">
      <span className="text-sm text-muted-foreground font-medium">
        Page {page} of {totalPages} · {total} results
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => router.push(buildUrl(page - 1))}
          className="gap-1.5 rounded-xl"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => router.push(buildUrl(page + 1))}
          className="gap-1.5 rounded-xl"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
