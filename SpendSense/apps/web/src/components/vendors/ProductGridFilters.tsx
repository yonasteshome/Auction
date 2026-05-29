"use client";

import React from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
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

interface ProductGridFiltersProps {
  categories: string[];
  pagination?: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
  };
  hidePagination?: boolean;
}

export default function ProductGridFilters({
  categories,
  pagination,
  hidePagination = false,
}: ProductGridFiltersProps) {
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault("All")
  );
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    "page_size",
    parseAsInteger.withDefault(12)
  );

  const allCategories = ["All", ...categories];
  const { current_page, total_pages } = pagination || {
    current_page: 1,
    total_pages: 1,
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setPage(1); // Reset page on category change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= total_pages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (val: string) => {
    setPageSize(parseInt(val));
    setPage(1); // Reset to page 1 on page size change
  };

  // Helper to generate pagination items with ellipsis
  const renderPageItems = () => {
    const items = [];
    const delta = 1; // Number of pages to show before and after current page

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

  return (
    <div className="space-y-6 pt-2 pb-4">
      {/* Category Tabs UI */}
      <Tabs
        defaultValue={category}
        value={category}
        onValueChange={handleCategoryChange}
        className="w-full"
      >
        <TabsList className="flex items-center justify-start gap-2 bg-transparent p-0 overflow-x-auto w-full scrollbar-none h-auto select-none rounded-none border-b">
          {allCategories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent px-4 py-2.5 bg-transparent rounded-none text-xs font-semibold shrink-0 cursor-pointer"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Pagination & Page Size controls (optional) */}
      {!hidePagination && total_pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>Show</span>
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
            >
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

          {/* Pagination controls */}
          <Pagination className="w-auto m-0 select-none">
            <PaginationContent className="gap-1 sm:gap-2">
              {/* Previous page link */}
              <PaginationItem className="cursor-pointer">
                <PaginationPrevious
                  onClick={() => handlePageChange(current_page - 1)}
                  className={`rounded-lg font-bold text-xs ${
                    current_page === 1 ? "pointer-events-none opacity-50" : ""
                  }`}
                />
              </PaginationItem>

              {/* Page items with ellipsis */}
              {renderPageItems()}

              {/* Next page link */}
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
      )}
    </div>
  );
}
