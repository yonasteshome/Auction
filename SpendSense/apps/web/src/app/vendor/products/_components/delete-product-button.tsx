"use client";

import { deleteListingAction } from "@/actions/vendor/listingActions";
import { Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type DeleteProductButtonProps = {
  listingId: string;
  productName: string;
};

export function DeleteProductButton({
  listingId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteListingAction(listingId);

      if (result.success) {
        toast.success("Product deleted", {
          description: `${productName} was removed from your catalog.`,
        });
        setOpen(false);
        router.refresh();
        return;
      }

      toast.error("Failed to delete product", {
        description: result.message,
      });
    });
  }

  return (
    <>
      <button
        aria-label={`Delete ${productName}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f2f4] text-slate-500 transition-all hover:bg-red-100 hover:text-[#e73908]"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Trash2 size={16} />
      </button>

      {open ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Delete product?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This will remove{" "}
                  <span className="font-bold text-slate-800">
                    {productName}
                  </span>{" "}
                  from your storefront.
                </p>
              </div>
              <button
                aria-label="Close delete confirmation"
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                type="button"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                disabled={isPending}
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-[#e73908] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                disabled={isPending}
                type="button"
                onClick={handleDelete}
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
