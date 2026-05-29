"use client";

import {
    approveSubmission,
    bulkApproveSubmissions,
    fetchModerationStats,
    rejectSubmission,
} from "@/actions/admin-submissions";
import { triggerMlRetrain } from "@/actions/admin/ml-actions";
import type { AdminModerationStats, AdminSubmission } from "@/types/api/admin-submissions";
import {
    AlertTriangle,
    BrainCircuit,
    CheckCircle2,
    ChevronLeft, ChevronRight,
    Clock,
    Eye,
    Filter,
    MapPin,
    RefreshCw,
    Search,
    User,
    XCircle,
    Zap,
} from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  initialSubmissions: AdminSubmission[];
  initialPagination: { total_records: number; total_pages: number; page_size: number; current_page: number };
  stats: AdminModerationStats;
}

const STATUS_TABS = [
  { key: "pending", label: "Pending", color: "text-amber-600 border-amber-500" },
  { key: "approved", label: "Approved", color: "text-emerald-600 border-emerald-500" },
  { key: "rejected", label: "Rejected", color: "text-red-600 border-red-500" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

const FLAG_STYLES: Record<string, string> = {
  outlier: "bg-red-100 text-red-700 border border-red-200",
  normal: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ET", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(iso: string | null) {
  if (!iso) return "Not trained yet";
  return new Date(iso).toLocaleString("en-ET", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SubmissionCard({
  sub,
  isSelected,
  isActive,
  onSelect,
  onActivate,
}: {
  sub: AdminSubmission;
  isSelected: boolean;
  isActive: boolean;
  onSelect: () => void;
  onActivate: () => void;
}) {
  const flag = sub.outlier_flag ? "outlier" : sub.status === "pending" ? "pending" : "normal";
  return (
    <article
      onClick={onActivate}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${isActive ? "ring-2 ring-blue-500 border-blue-300" : "border-slate-200 hover:border-blue-200"}`}
    >
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onChange={() => {}}
          className="mt-1 h-4 w-4 rounded border-slate-300 accent-blue-600"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h4 className="truncate font-bold text-slate-900">{sub.item_name}</h4>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${FLAG_STYLES[flag]}`}>
              {sub.outlier_flag ? "⚠ Outlier" : sub.status}
            </span>
          </div>
          <p className="mb-2 text-xl font-black text-blue-700">
            {parseFloat(sub.price_value).toLocaleString()} ETB
            {sub.unit ? <span className="text-sm font-medium text-slate-500">/{sub.unit}</span> : null}
          </p>
          <div className="space-y-0.5 text-xs text-slate-500">
            <p className="flex items-center gap-1"><MapPin size={10} />{sub.market_location}, {sub.city}</p>
            <p className="flex items-center gap-1"><User size={10} />{sub.submitter_email}</p>
            <p className="flex items-center gap-1"><Clock size={10} />{formatDate(sub.created_at)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function RejectModal({ onConfirm, onCancel, isLoading }: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const QUICK_REASONS = ["Price too high — likely error", "Price too low — outlier", "Location unverifiable", "Duplicate submission", "Insufficient data"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-1 text-lg font-bold text-slate-900">Reject Submission</h3>
        <p className="mb-4 text-sm text-slate-500">Provide a reason to help the contributor improve future submissions.</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_REASONS.map((r) => (
            <button key={r} type="button" onClick={() => setReason(r)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${reason === r ? "bg-red-600 text-white border-red-600" : "border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-700"}`}>
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Or write a custom reason…"
          rows={3}
          className="mb-4 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
        />
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" disabled={isLoading} onClick={() => onConfirm(reason)}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:bg-red-700">
            {isLoading ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sky-100 bg-white px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function PriceModerationClient({ initialSubmissions, initialPagination, stats: initialStats }: Props) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [pagination, setPagination] = useState(initialPagination);
  const [stats, setStats] = useState(initialStats);
  const [activeTab, setActiveTab] = useState<StatusTab>("pending");
  const [focusedId, setFocusedId] = useState<number | null>(initialSubmissions[0]?.id ?? null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isTraining, startTraining] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const focused = submissions.find((s) => s.id === focusedId) ?? null;

  const fetchPage = useCallback(async (opts: { status?: StatusTab; page?: number; q?: string } = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: opts.status ?? activeTab,
        page: String(opts.page ?? pagination.current_page),
        page_size: "12",
        ...(opts.q ?? search ? { search: opts.q ?? search } : {}),
      });
      const res = await fetch(`/api/market/admin/submissions/?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSubmissions(data.results ?? []);
      setPagination(data.pagination);
      setFocusedId(data.results?.[0]?.id ?? null);
      setSelected(new Set());
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, pagination.current_page, search]);

  const refreshStats = useCallback(async () => {
    const result = await fetchModerationStats();
    if (result.success) {
      setStats(result.data);
      return;
    }
    toast.error(result.message);
  }, []);

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    fetchPage({ status: tab, page: 1 });
  };

  const handleApprove = (id: number) => {
    startTransition(async () => {
      const result = await approveSubmission(id);
      if (result.success) {
        toast.success("Submission approved ✓");
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        setStats((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1), approved_today: prev.approved_today + 1 }));
        setFocusedId((prev) => submissions.find((s) => s.id !== id)?.id ?? null);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRejectConfirm = (reason: string) => {
    if (rejectTarget === null) return;
    const id = rejectTarget;
    setRejectTarget(null);
    startTransition(async () => {
      const result = await rejectSubmission(id, reason);
      if (result.success) {
        toast.success("Submission rejected");
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        setStats((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1), rejected_today: prev.rejected_today + 1 }));
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleBulkApprove = () => {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await bulkApproveSubmissions(ids);
      if (result.success) {
        toast.success(`Approved ${result.data.approved.length} submissions`);
        setSubmissions((prev) => prev.filter((s) => !ids.includes(s.id)));
        setStats((prev) => ({ ...prev, pending: Math.max(0, prev.pending - ids.length), approved_today: prev.approved_today + ids.length }));
        setSelected(new Set());
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleTrainModel = () => {
    startTraining(async () => {
      const result = await triggerMlRetrain(4);
      if (result.success) {
        toast.success("Model retraining started and completed successfully");
        await refreshStats();
      } else {
        toast.error(result.message);
      }
    });
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleAll = () => {
    setSelected((prev) => prev.size === submissions.length ? new Set() : new Set(submissions.map((s) => s.id)));
  };

  return (
    <>
      {/* Stats Bar */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
          { label: "Approved Today", value: stats.approved_today, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
          { label: "Rejected Today", value: stats.rejected_today, icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
          { label: "Outliers", value: stats.outlier_flagged, icon: AlertTriangle, color: "text-orange-600 bg-orange-50 border-orange-200" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl border p-4 ${color}`}>
            <Icon size={20} />
            <div>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs font-medium opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-sky-200 bg-gradient-to-r from-white to-sky-50 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Model Health (Real)</p>
            <p className="mt-1 text-sm text-slate-600">
              Last run: <span className="font-semibold text-slate-800">{formatDateTime(stats.ml.last_run_at)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleTrainModel}
            disabled={isTraining}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            <BrainCircuit size={16} /> {isTraining ? "Training..." : "Train Model"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <MiniStat label="Model" value={stats.ml.last_run_model ?? "N/A"} />
          <MiniStat label="Status" value={stats.ml.last_run_status ?? "N/A"} />
          <MiniStat label="MAPE" value={stats.ml.avg_mape !== null ? `${stats.ml.avg_mape}%` : "N/A"} />
          <MiniStat label="MSE" value={stats.ml.avg_mse !== null ? String(stats.ml.avg_mse) : "N/A"} />
          <MiniStat label="Runs" value={String(stats.ml.model_runs_total)} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Tabs */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {STATUS_TABS.map((tab) => (
            <button key={tab.key} type="button" onClick={() => handleTabChange(tab.key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${activeTab === tab.key ? `bg-blue-600 text-white` : "text-slate-600 hover:text-slate-900"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm min-w-48">
          <Search size={14} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPage({ page: 1, q: search })}
            placeholder="Search items, city, submitter…"
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        {selected.size > 0 && (
          <button type="button" onClick={handleBulkApprove} disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-60 hover:bg-emerald-700">
            <Zap size={14} /> Approve {selected.size} Selected
          </button>
        )}

        <button type="button" onClick={() => fetchPage()} disabled={isLoading}
          className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={14} className={`text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Queue List */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <input type="checkbox" onChange={toggleAll} checked={selected.size === submissions.length && submissions.length > 0}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
              <span className="text-xs font-medium text-slate-500">{pagination.total_records} submissions</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <button type="button" disabled={pagination.current_page <= 1 || isLoading}
                onClick={() => fetchPage({ page: pagination.current_page - 1 })}
                className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 hover:bg-slate-50">
                <ChevronLeft size={12} />
              </button>
              <span>{pagination.current_page}/{pagination.total_pages}</span>
              <button type="button" disabled={pagination.current_page >= pagination.total_pages || isLoading}
                onClick={() => fetchPage({ page: pagination.current_page + 1 })}
                className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 hover:bg-slate-50">
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
              ))
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-slate-500">
                <CheckCircle2 size={32} className="mb-2 opacity-30" />
                <p className="font-medium">No {activeTab} submissions</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <SubmissionCard
                  key={sub.id}
                  sub={sub}
                  isSelected={selected.has(sub.id)}
                  isActive={focusedId === sub.id}
                  onSelect={() => toggleSelect(sub.id)}
                  onActivate={() => setFocusedId(sub.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {focused ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Image */}
              <div className="relative h-52 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                {focused.image ? (
                  <img src={focused.image} alt={focused.item_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400">
                    <Eye size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No photo submitted</p>
                  </div>
                )}
                {focused.outlier_flag && (
                  <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow">
                    <AlertTriangle size={12} /> Outlier Detected
                  </span>
                )}
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{focused.item_name}</h3>
                    <p className="text-sm text-slate-500">{focused.market_location}, {focused.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-blue-700">{parseFloat(focused.price_value).toLocaleString()} ETB</p>
                    {focused.unit && <p className="text-sm text-slate-500">per {focused.unit}</p>}
                  </div>
                </div>

                {/* Detail Grid */}
                <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">
                  {[
                    { label: "Submitted by", value: focused.submitter_email },
                    { label: "Date Observed", value: focused.date_observed },
                    { label: "Time", value: focused.time_observed || "—" },
                    { label: "Quality Grade", value: focused.quality_grade || "—" },
                    { label: "Vendor", value: focused.vendor_name || "—" },
                    { label: "Quantity", value: focused.quantity_available ? `${focused.quantity_available} ${focused.unit}` : "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800 truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {focused.notes && (
                  <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Notes</p>
                    <p className="text-sm text-slate-700">{focused.notes}</p>
                  </div>
                )}

                {focused.rejection_reason && focused.status === "rejected" && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-red-600">Rejection Reason</p>
                    <p className="text-sm text-red-800">{focused.rejection_reason}</p>
                  </div>
                )}

                {/* Actions */}
                {focused.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setRejectTarget(focused.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700 transition-colors disabled:opacity-60 hover:bg-red-100"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleApprove(focused.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow transition-colors disabled:opacity-60 hover:bg-blue-700"
                    >
                      <CheckCircle2 size={18} /> {isPending ? "Approving…" : "Approve"}
                    </button>
                  </div>
                )}

                {focused.status !== "pending" && (
                  <div className={`flex items-center gap-2 rounded-xl p-3 font-semibold text-sm ${focused.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {focused.status === "approved" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    This submission was {focused.status}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400">
              <div className="text-center">
                <Filter size={32} className="mx-auto mb-2 opacity-30" />
                <p className="font-medium">Select a submission to review</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {rejectTarget !== null && (
        <RejectModal
          isLoading={isPending}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </>
  );
}
