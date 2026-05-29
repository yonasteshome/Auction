"use client";

import { useQueryState, parseAsInteger } from 'nuqs';

type Props = {
  totalPages: number;
};

export default function UsersPaginationClient({ totalPages }: Props) {
  // We don't need to pass page/search as props anymore! 
  // We read them directly from the URL via nuqs.
  const [page, setPage] = useQueryState('page', 
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  const handlePageChange = (step: number) => {
    const next = page + step;
    if (next >= 1 && next <= totalPages) {
      setPage(next);
    }
  };

  return (
    <div className="p-4 flex items-center justify-center gap-4">
      <button
        type="button"
        className="px-3 py-1 rounded border disabled:opacity-50"
        onClick={() => handlePageChange(-1)}
        disabled={page <= 1}
      >
        Prev
      </button>
      
      <div className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </div>
      
      <button
        type="button"
        className="px-3 py-1 rounded border disabled:opacity-50"
        onClick={() => handlePageChange(1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}