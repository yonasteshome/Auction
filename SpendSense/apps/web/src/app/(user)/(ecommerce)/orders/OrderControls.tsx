"use client";

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useTransition } from "react";

export function OrderSearch() {
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault('').withOptions({ shallow: false }));
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative max-w-sm w-full md:w-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by ID or vendor..."
        defaultValue={search}
        className="pl-9 bg-background"
        onChange={(e) => {
          startTransition(() => {
            setSearch(e.target.value || null);
          });
        }}
      />
    </div>
  );
}

export function OrderPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1).withOptions({ shallow: false }));
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage <= 1 || isPending}
        onClick={() => startTransition(() => { setPage(currentPage - 1); })}
      >
        <ChevronLeft size={16} />
      </Button>
      <span className="text-sm font-medium text-muted-foreground">
        Page {currentPage} of {Math.max(1, totalPages)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage >= totalPages || isPending}
        onClick={() => startTransition(() => { setPage(currentPage + 1); })}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
