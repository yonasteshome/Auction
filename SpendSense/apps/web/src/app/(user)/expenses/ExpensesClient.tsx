"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

export function ExpensesControlsClient({ currentCount }: { currentCount: number }) {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(20)  );

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder="Search categories or notes..."
          className="pl-9"
          value={search ?? ""}
          onChange={(e) => {
            setSearch(e.target.value || null);
            setPage(1); // Reset to first page on search
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 whitespace-nowrap">Show</span>
        <Select
          value={String(pageSize)}
          onValueChange={(val) => {
            setPageSize(parseInt(val));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="20" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function ExpensesPaginationClient({
  totalPages,
  currentPage,
}: {
  totalPages: number;
  currentPage: number;
}) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  return (
    <div className="flex items-center justify-between mt-6 px-2">
      <div className="text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => setPage(currentPage - 1)}
        >
          <ChevronLeft className="size-4 mr-1" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => setPage(currentPage + 1)}
        >
          Next
          <ChevronRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
