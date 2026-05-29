"use client";

import React from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

interface PaginationControlsProps {
  pagination: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
  };
}

export default function PaginationControls({ pagination }: PaginationControlsProps) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("page_size", parseAsInteger.withDefault(12));

  const { current_page, total_pages } = pagination;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= total_pages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (val: string) => {
    setPageSize(parseInt(val));
    setPage(1);
  };

  const renderPageItems = () => {
    const items = [];
    const delta = 1;
    for (let i = 1; i <= total_pages; i++) {
      if (
        i === 1 ||
        i === total_pages ||
        (i >= current_page - delta && i <= current_page + delta)
      ) {
        items.push(
          <PaginationItem key={i} className="cursor-pointer">
            <PaginationLink
              isActive={current_page === i}
              onClick={() => handlePageChange(i)}
              className="rounded-lg font-bold text-xs"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (
        i === current_page - delta - 1 ||
        i === current_page + delta + 1
      ) {
        items.push(
          <PaginationItem key={`ellipsis-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    return items;
  };

  if (total_pages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span>Show</span>
        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-16 h-8 rounded-lg text-xs font-bold">
            <SelectValue placeholder="12" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="48">48</SelectItem>
          </SelectContent>
        </Select>
        <span>products per page</span>
      </div>

      <Pagination className="w-auto m-0 select-none">
        <PaginationContent className="gap-1 sm:gap-2">
          <PaginationItem className="cursor-pointer">
            <PaginationPrevious
              onClick={() => handlePageChange(current_page - 1)}
              className={`rounded-lg font-bold text-xs ${
                current_page === 1 ? "pointer-events-none opacity-50" : ""
              }`}
            />
          </PaginationItem>

          {renderPageItems()}

          <PaginationItem className="cursor-pointer">
            <PaginationNext
              onClick={() => handlePageChange(current_page + 1)}
              className={`rounded-lg font-bold text-xs ${
                current_page === total_pages ? "pointer-events-none opacity-50" : ""
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
