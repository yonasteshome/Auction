import { CalendarDays, Download, Search } from "lucide-react";
import AdminPanelShell from "../_components/admin-panel-shell";

type LogEntry = {
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  status: "Success" | "Audit Required";
};

const logs: LogEntry[] = [
  {
    timestamp: "Oct 24, 14:22:15",
    actor: "Abebe Ayele",
    role: "Super Admin",
    action: "Verified Vendor Profile",
    target: "Merkato Electronics PLC",
    ip: "197.156.112.45",
    status: "Success",
  },
  {
    timestamp: "Oct 24, 13:05:42",
    actor: "Sara Mohammed",
    role: "Moderator",
    action: "Flagged Price Anomaly",
    target: "Teff Grade A - Bulk",
    ip: "213.55.101.12",
    status: "Success",
  },
  {
    timestamp: "Oct 24, 11:45:00",
    actor: "Abebe Ayele",
    role: "Super Admin",
    action: "Changed API Keys",
    target: "System.Security.Core",
    ip: "197.156.112.45",
    status: "Audit Required",
  },
  {
    timestamp: "Oct 24, 10:15:33",
    actor: "Kidus Tadesse",
    role: "Moderator",
    action: "Banned User Account",
    target: "usr_99827 (Mulugeta)",
    ip: "196.188.12.204",
    status: "Success",
  },
];

export default function AuditLogsPage() {
  return (
    <AdminPanelShell
      activeTab="audit"
      subtitle="Chronological records of administrative actions and security-sensitive events."
      title="System Audit Trail"
    >
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="w-full rounded-lg border-none bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Search audit logs..."
            type="text"
          />
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700" type="button">
            <Download size={14} /> Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" type="button">
            <CalendarDays size={14} /> Last 30 Days
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard label="Total Actions (24h)" value="1,284" accent="blue" />
        <StatCard label="Security Alerts" value="0" accent="red" meta="Healthy State" />
        <StatCard label="Active Admin Sessions" value="8" accent="indigo" />
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50 p-4">
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option>All Actions</option>
            <option>Vendor Verification</option>
            <option>User Ban</option>
            <option>Settings Update</option>
          </select>
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option>Everyone</option>
            <option>Super Admins</option>
            <option>Moderators</option>
          </select>
          <p className="ml-auto text-xs italic text-slate-500">Showing 1-15 of 450 records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((entry) => (
                <tr key={`${entry.timestamp}-${entry.action}`} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{entry.timestamp}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{entry.actor}</p>
                    <p className="text-xs text-slate-500">{entry.role}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{entry.action}</td>
                  <td className="px-6 py-4 text-blue-700">{entry.target}</td>
                  <td className="px-6 py-4 text-slate-500">{entry.ip}</td>
                  <td className="px-6 py-4">
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        entry.status === "Success" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
                      ].join(" ")}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-4">
          <p className="text-sm text-slate-500">Total 450 actions logged since deployment</p>
          <div className="flex gap-2">
            <button className="rounded border border-slate-200 px-3 py-1 text-sm" type="button">Prev</button>
            <button className="rounded bg-blue-600 px-3 py-1 text-sm font-bold text-white" type="button">1</button>
            <button className="rounded border border-slate-200 px-3 py-1 text-sm" type="button">2</button>
            <button className="rounded border border-slate-200 px-3 py-1 text-sm" type="button">Next</button>
          </div>
        </div>
      </section>
    </AdminPanelShell>
  );
}

function StatCard({ label, value, accent, meta }: { label: string; value: string; accent: "blue" | "red" | "indigo"; meta?: string }) {
  const accentClass = accent === "blue" ? "border-blue-600" : accent === "red" ? "border-red-500" : "border-indigo-500";

  return (
    <article className={["rounded-xl border-l-4 bg-white p-6 shadow-sm", accentClass].join(" ")}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-4xl font-black tracking-tight text-slate-900">{value}</p>
        {meta ? <span className="text-xs text-slate-500">{meta}</span> : null}
      </div>
    </article>
  );
}
