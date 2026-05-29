"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useAuth } from "@/providers/auth-provider";
import { createApiClient } from "@/lib/finance-utils";
import type { ExpenseRecord } from "@/types/finance";

export default function ExpenseEditPage() {
  const params = useParams();
  const id = Number.parseInt(String(params.id), 10);
  const router = useRouter();
  const { accessToken, status } = useAuth();
  const [row, setRow] = useState<ExpenseRecord | null>(null);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken || !Number.isFinite(id)) return;
    setLoading(true);
    try {
      const api = createApiClient(accessToken);
      const { data } = await api.get<ExpenseRecord>(`/api/finance/expenses/${id}/`);
      setRow(data);
      setCategory(data.category);
      setAmount(String(data.amount));
      setDate(data.date);
      setDescription(data.description ?? "");
    } catch {
      setError("Expense not found.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    if (status === "authenticated" && accessToken) void load();
  }, [status, accessToken, load]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-60 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading…
      </div>
    );
  }

  if (error && !row) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Edit expense</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Amount (ETB)</label>
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={saving || !accessToken}
          onClick={async () => {
            if (!accessToken) return;
            setSaving(true);
            setError(null);
            try {
              const api = createApiClient(accessToken);
              await api.patch(`/api/finance/expenses/${id}/`, {
                category,
                amount: amount || "0",
                date,
                description: description || undefined,
              });
              router.push("/expenses");
            } catch {
              setError("Update failed.");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving || !accessToken}
          onClick={async () => {
            if (!accessToken) return;
            if (!window.confirm("Delete this expense?")) return;
            setSaving(true);
            try {
              const api = createApiClient(accessToken);
              await api.delete(`/api/finance/expenses/${id}/`);
              router.push("/expenses");
            } catch {
              setError("Delete failed.");
            } finally {
              setSaving(false);
            }
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
