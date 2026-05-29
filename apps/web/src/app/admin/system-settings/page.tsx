import { KeyRound, Lightbulb, Palette, TrendingUp } from "lucide-react";
import AdminPanelShell from "../_components/admin-panel-shell";

export default function SystemSettingsPage() {
  return (
    <AdminPanelShell
      activeTab="settings"
      subtitle="Manage global thresholds, fees, and security integrations for the SpendSense platform."
      title="System Configuration"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-xl bg-white p-8 shadow-sm lg:col-span-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700"><TrendingUp size={18} /></div>
            <h3 className="text-lg font-bold">Price Spike Thresholds</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Essential Commodities Spike (%)" suffix="%" value="15" />
            <Field label="Luxury & Tech Spike (%)" suffix="%" value="35" />
          </div>
        </section>

        <section className="rounded-xl bg-white p-8 shadow-sm lg:col-span-4">
          <h3 className="mb-6 text-lg font-bold">Platform Fees</h3>
          <div className="space-y-4">
            <Field label="Standard Commission" suffix="%" value="2.5" />
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Merchant Payout Delay</p>
              <select className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-200">
                <option>Instant (T+0)</option>
                <option>Next Day (T+1)</option>
                <option>Weekly (Friday)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white shadow-sm lg:col-span-12">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-900 p-2 text-white"><KeyRound size={18} /></div>
              <h3 className="text-lg font-bold">API & Integration Keys</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-100 p-6">
            <KeyRow name="National Bank price_feed_api" value="sk_live_51MxxxxxxxxxxxxxxxxxW9q" />
            <KeyRow name="Ethio-Telecom Gateway Hook" value="webhook_sec_xxxxxxxxxxxxxxxxx2n1" />
          </div>
        </section>

        <section className="rounded-xl bg-white p-8 shadow-sm lg:col-span-6">
          <h3 className="mb-4 text-lg font-bold">Alert Frequencies</h3>
          <div className="space-y-4">
            <SettingRow title="Critical Price Warnings" subtitle="Immediate push notifications" />
            <SettingRow title="Vendor Compliance Digests" subtitle="Summary of audit violations" />
          </div>
        </section>

        <section className="rounded-xl bg-white p-8 shadow-sm lg:col-span-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700"><Palette size={18} /></div>
            <h3 className="text-lg font-bold">Brand Customization</h3>
          </div>
          <button className="w-full rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50" type="button">
            Enter Advanced Theming Editor
          </button>
        </section>
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-xl bg-blue-50 p-6">
        <Lightbulb className="text-blue-700" size={20} />
        <p className="text-sm text-blue-900">Recommended: set essential commodity threshold to 12.5% for the next 30 days.</p>
      </div>
    </AdminPanelShell>
  );
}

function Field({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <div className="relative">
        <input className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-200" defaultValue={value} type="number" />
        {suffix ? <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{suffix}</span> : null}
      </div>
    </div>
  );
}

function KeyRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-sm font-bold text-slate-900">{name}</p>
        <code className="text-xs text-slate-500">{value}</code>
      </div>
      <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200" type="button">
        Rotate
      </button>
    </div>
  );
}

function SettingRow({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl bg-slate-100 p-4">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}
