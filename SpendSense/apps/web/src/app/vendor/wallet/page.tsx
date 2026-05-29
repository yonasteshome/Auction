export const dynamic = "force-dynamic";

import { apiClient, ApiError } from "@/lib/api";
import { formatMoney } from "../_lib/vendor-api";
import WithdrawForm from "./WithdrawForm";

type WalletEntry = {
  id: string | number;
  transaction_reference: string;
  entry_type: string;
  amount: string | number;
  balance_after: string | number;
  source?: string;
  note?: string;
  created_at?: string;
};

type WalletResponse = {
  wallet?: {
    balance?: string | number;
    currency?: string;
    updated_at?: string | null;
  };
  entries?: WalletEntry[];
};

type Payout = {
  id: string | number;
  amount: string | number;
  currency?: string;
  status?: string;
  requested_at?: string;
  processed_at?: string | null;
  transaction_reference?: string;
  admin_note?: string;
};

type PayoutResponse = {
  payouts?: Payout[];
};

export default async function VendorWalletPage() {
  let wallet: WalletResponse["wallet"] = { balance: "0.00", currency: "ETB", updated_at: null };
  let entries: WalletEntry[] = [];
  let payouts: Payout[] = [];
  let error = "";

  try {
    const [walletData, payoutData] = await Promise.all([
      apiClient<WalletResponse>({
        method: "GET",
        endpoint: "/api/users/me/vendor-wallet/",
      }),
      apiClient<PayoutResponse>({
        method: "GET",
        endpoint: "/api/users/me/wallet/withdrawals/",
      }),
    ]);

    const data = walletData;
    wallet = data.wallet ?? wallet;
    entries = data.entries ?? [];
    payouts = payoutData.payouts ?? [];
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      error = err.message;
    } else if (err instanceof Error) {
      error = err.message;
    } else {
      error = "Failed to load wallet";
    }
  }

  const currency = wallet?.currency || "ETB";
  const balance = Number(wallet?.balance ?? 0);

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">SpendSense Vendor Panel</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Wallet</h2>
          <p className="mt-1 text-sm text-slate-500">Track the money credited from paid Chapa orders.</p>
        </header>

        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Balance</p>
            <p className="mt-3 text-4xl font-black tracking-tight text-[#135bec]">
              {formatMoney(balance, currency)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Updated {wallet?.updated_at ? new Date(String(wallet.updated_at)).toLocaleString() : "after each successful payment"}.
            </p>
            <WithdrawForm balance={balance} currency={currency} />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Ledger</p>
                <h3 className="text-lg font-bold">Recent Wallet Entries</h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                {entries.length} entries
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Balance After</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {entries.map((entry) => (
                    <tr key={String(entry.id)} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-xs font-semibold">{entry.transaction_reference}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={[
                          "rounded-full px-2 py-1 text-[10px] font-bold uppercase",
                          entry.entry_type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                        ].join(" ")}>
                          {entry.entry_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">{formatMoney(entry.amount, currency)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{formatMoney(entry.balance_after, currency)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {entry.created_at ? new Date(entry.created_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                  {!entries.length ? (
                    <tr>
                      <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                        No wallet entries yet. Paid Chapa orders will appear here.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Withdrawals</p>
              <h3 className="text-lg font-bold">Payout History</h3>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              {payouts.length} records
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3">Processed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payouts.map((payout) => (
                  <tr key={String(payout.id)} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-xs font-semibold">{payout.transaction_reference || payout.id}</td>
                    <td className="px-4 py-3 text-sm font-bold">{formatMoney(payout.amount, payout.currency || currency)}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={[
                        "rounded-full px-2 py-1 text-[10px] font-bold uppercase",
                        payout.status === "paid" ? "bg-emerald-100 text-emerald-700" : payout.status === "approved" ? "bg-blue-100 text-blue-700" : payout.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700",
                      ].join(" ")}>
                        {payout.status || "requested"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {payout.requested_at ? new Date(String(payout.requested_at)).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {payout.processed_at ? new Date(String(payout.processed_at)).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
                {!payouts.length ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                      No withdrawals yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}