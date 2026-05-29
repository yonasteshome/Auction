import Link from "next/link";
import { Bell, ChevronRight, Lock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-slate-500">Manage notifications and preferences.</p>
      
      <div className="space-y-3">
        <Link
          href="/settings/alerts"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
        >
          <span className="flex items-center gap-2 font-medium">
            <Bell className="size-5 text-slate-500" />
            Alerts
          </span>
          <ChevronRight className="size-5 text-slate-400" />
        </Link>

        <Link
          href="/settings/password"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
        >
          <span className="flex items-center gap-2 font-medium">
            <Lock className="size-5 text-slate-500" />
            Security & Password
          </span>
          <ChevronRight className="size-5 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}

