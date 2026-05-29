import { Wallet } from "lucide-react";

interface SummaryCardProps {
  label: string;
  value: string;
}

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-[#dbdfe6] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <Wallet className="size-4 text-[#135bec]" />
        <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}