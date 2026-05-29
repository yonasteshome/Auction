"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import useUrlQueryState from "@/lib/hooks/useUrlQueryState";

export default function UsersControlsClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useUrlQueryState("search", "");
  const [pageStr, setPageStr] = useUrlQueryState("page", "1");
  const [pageSizeStr, setPageSizeStr] = useUrlQueryState("pageSize", "10");

  // local numeric state derived from query-state strings
  const page = Number(pageStr) || 1;
  const pageSize = Number(pageSizeStr) || 20;

  // With useUrlQueryState we're updating each key individually and preserving other params.
  function pushParams(next: { search?: string; page?: number; pageSize?: number }) {
    if (next.search !== undefined) setSearch(next.search ?? "");
    if (next.page !== undefined) setPageStr(String(next.page));
    if (next.pageSize !== undefined) setPageSizeStr(String(next.pageSize));
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      pushParams({ search, page: 1, pageSize });
    });
  };

  const goPage = (nextPage: number) => {
    startTransition(() => {
      pushParams({ search, page: nextPage, pageSize });
    });
  };

  const changePageSize = (size: number) => {
    startTransition(() => {
      pushParams({ search, page: 1, pageSize: size });
    });
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <form className="flex gap-2 items-center" onSubmit={onSubmit}>
          <input
          aria-label="Search users"
          className="rounded-md border px-3 py-2 text-sm w-full"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Searching..." : "Search"}
        </button>
        <select
          value={pageSize}
          onChange={(e) => changePageSize(Number(e.target.value))}
          className="ml-2 rounded-md border px-2 py-2 text-sm"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </form>

    </div>
  );
}
