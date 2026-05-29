export const dynamic = "force-dynamic";

import { triggerMlRetrain } from "@/actions/admin/ml-actions";
import { getAdminMlMonitoring } from "@/services/adminMlMonitoringService";
import { Download, RefreshCw, TriangleAlert } from "lucide-react";
import AdminPanelShell from "../_components/admin-panel-shell";

function formatEventTimestamp(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (sameDay) {
    return `Today, ${time}`;
  }
  const datePart = d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  return `${datePart}, ${time}`;
}

export default async function MlMonitoringPage() {
  let monitoring;
  let errorMessage: string | null = null;

  try {
    monitoring = await getAdminMlMonitoring();
  } catch (error) {
    console.error("Failed to load admin ML monitoring", error);
    errorMessage = error instanceof Error ? error.message : String(error ?? "Unknown error");
  }

  if (errorMessage || !monitoring) {
    return (
      <AdminPanelShell
        activeTab="ml"
        subtitle="Analyze model performance, monitor drift, and manage automated retraining cycles."
        title="Model Monitoring Dashboard"
      >
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="text-sm font-semibold">Failed to load ML monitoring</p>
          <p className="mt-1 text-sm">{errorMessage}</p>
        </div>
      </AdminPanelShell>
    );
  }

  const trend = monitoring.trend.values.length
    ? monitoring.trend.values
    : Array.from({ length: 12 }, () => 0);

  const perf = monitoring.performance.values.length
    ? monitoring.performance.values
    : Array.from({ length: 9 }, () => 0);

  const events = monitoring.events;
  const liveModel = monitoring.live_model.model_used ?? "Not trained";

  return (
    <AdminPanelShell
      activeTab="ml"
      subtitle="Analyze model performance, monitor drift, and manage automated retraining cycles."
      title="Model Monitoring Dashboard"
    >
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700" type="button">
          <Download size={14} /> Export Report
        </button>
        <form action={async () => {
          "use server";
          await triggerMlRetrain(4);
        }}>
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white" type="submit">
            <RefreshCw size={14} /> Trigger Retraining
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="rounded-xl bg-white p-6 shadow-sm xl:col-span-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Forecast Accuracy (MAPE)</h3>
              <p className="text-sm text-slate-500">Mean absolute percentage error over last 30 days.</p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">Live Model: {liveModel}</span>
          </div>
          <div className="mt-8 flex h-48 items-end justify-between gap-1 border-b border-slate-200 px-2">
            {trend.map((point, idx) => (
              <div key={idx} className="w-full rounded-t bg-blue-600" style={{ height: `${point}%`, opacity: 0.15 + idx * 0.06 }} />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Oct 01</span>
            <span>Oct 15</span>
            <span>Today</span>
          </div>
        </section>

        <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm xl:col-span-4">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Data Drift Status</h3>
          {monitoring.drift.rows.map((row) => (
            <DriftRow key={row.label} label={row.label} value={row.value} width={row.width} tone={row.tone} />
          ))}
          {monitoring.drift.critical ? (
            <div className="mt-6 flex items-start gap-2 rounded-lg bg-red-100 p-3 text-sm text-red-800">
              <TriangleAlert size={16} className="mt-0.5" />
              {monitoring.drift.critical}
            </div>
          ) : null}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm xl:col-span-4">
          <h3 className="mb-6 text-lg font-bold text-slate-900">Retraining Schedule</h3>
          <div className="space-y-7 border-l border-slate-200 pl-6">
            {monitoring.timeline.map((item) => (
              <Timeline
                key={`${item.title}-${item.subtitle}-${item.tag}`}
                tone={item.tone}
                title={item.title}
                subtitle={item.subtitle}
                tag={item.tag}
                faded={item.faded}
              />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm xl:col-span-8">
          <div className="border-b border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900">Performance Over Time</h3>
          </div>
          <div className="relative h-56 bg-slate-50 p-6">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #135bec 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            <div className="relative flex h-full items-end gap-1 px-3">
              {perf.map((point, idx) => (
                <div key={idx} className="h-full flex-1 rounded-t bg-blue-600" style={{ height: `${point}%`, opacity: 0.2 + idx * 0.08 }} />
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm xl:col-span-12">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900">System Audit Log</h3>
            <button className="text-sm font-bold text-blue-700" type="button">View Full Logs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-4">Event Type</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Trigger</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event) => (
                  <tr key={`${event.type}-${event.ts}`} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{event.type}</td>
                    <td className="px-6 py-4 text-slate-700">{event.entity}</td>
                    <td className="px-6 py-4 text-slate-700">{event.trigger}</td>
                    <td className="px-6 py-4 text-slate-500">{formatEventTimestamp(event.ts)}</td>
                    <td className="px-6 py-4">
                      <span className={[
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        event.status === "Review Needed" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700",
                      ].join(" ")}
                      >
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminPanelShell>
  );
}

function DriftRow({ label, value, width, tone }: { label: string; value: string; width: string; tone: "error" | "ok" }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={tone === "error" ? "font-bold text-red-600" : "font-bold text-slate-500"}>{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div className={[
          "h-2 rounded-full",
          tone === "error" ? "bg-red-500" : "bg-blue-600",
        ].join(" ")} style={{ width }} />
      </div>
    </div>
  );
}

function Timeline({ title, subtitle, tag, tone, faded }: { title: string; subtitle: string; tag: string; tone: "blue" | "gray"; faded?: boolean }) {
  return (
    <div className={faded ? "opacity-60" : ""}>
      <div className="relative">
        <div className={[
          "absolute -left-[29px] top-1 h-3 w-3 rounded-full ring-4 ring-white",
          tone === "blue" ? "bg-blue-600" : "bg-slate-300",
        ].join(" ")} />
        <p className={[
          "mb-1 text-xs font-bold uppercase tracking-widest",
          tone === "blue" ? "text-blue-700" : "text-slate-500",
        ].join(" ")}
        >
          {tag}
        </p>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}
