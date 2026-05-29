"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
// Use browser fetch directly in client components to avoid server-only imports

export default function WithdrawForm({ balance, currency }: { balance: number; currency: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const amt = Number(amount || 0);
    if (!amt || amt <= 0) {
      setMessage("Enter a positive amount");
      return;
    }
    if (amt > balance) {
      setMessage("Amount exceeds wallet balance");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/users/me/wallet/withdrawals/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: String(amt), currency }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Request failed: ${resp.status}`);
      }
      setMessage('Withdrawal processed');
      setAmount('');
      router.refresh();
    } catch (err: any) {
      setMessage(err?.message || 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6">
      <label className="block text-xs font-bold uppercase text-slate-500">Withdraw Now</label>
      <div className="mt-2 flex gap-2">
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Amount"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-bold text-white"
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </div>
      {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
