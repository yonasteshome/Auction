export const dynamic = "force-dynamic";

import { AdminActivityChart } from "@/components/admin/admin-activity-chart";
import { AdminModerationMixChart } from "@/components/admin/admin-moderation-mix-chart";
import { VendorRankingSwitcher } from "@/components/admin/vendor-ranking-switcher";
import { getAdminDashboard } from "@/services/adminDashboardService";
import { AlertTriangle, BarChart3, ShieldAlert, Store, Users } from "lucide-react";
import AdminPanelShell from "../_components/admin-panel-shell";

export default async function AdminPanelDashboardPage() {
	let dashboard;
	let errorMessage: string | null = null;

	try {
		dashboard = await getAdminDashboard();
	} catch (error) {
		console.error("Failed to load admin dashboard", error);
		errorMessage = error instanceof Error ? error.message : String(error ?? "Unknown error");
	}

	if (errorMessage || !dashboard) {
		return (
			<AdminPanelShell
				activeTab="dashboard"
				subtitle="Operational summary of users, vendors, moderation, and platform health."
				title="Admin Dashboard"
			>
				<div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
					<p className="text-sm font-semibold">Failed to load admin dashboard</p>
					<p className="mt-1 text-sm">{errorMessage}</p>
				</div>
			</AdminPanelShell>
		);
	}

	const { stats, activity_trend, recent_activity, top_rated_vendors, least_rated_vendors } = dashboard;

	return (
		<AdminPanelShell
			activeTab="dashboard"
			subtitle="Bright live metrics from the backend: users, vendor moderation, suspensions, and review signals."
			title="Admin Dashboard"
		>
			<section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Tile label="Total Users" value={stats.total_users} icon={<Users size={18} />} tone="slate" />
				<Tile label="Active Users" value={stats.active_users} icon={<Users size={18} />} tone="green" />
				<Tile label="Verified Vendors" value={stats.verified_vendors} icon={<Store size={18} />} tone="blue" />
				<Tile label="Pending Verification" value={stats.pending_vendors} icon={<ShieldAlert size={18} />} tone="amber" />
				<Tile label="Suspended Vendors" value={stats.suspended_vendors} icon={<AlertTriangle size={18} />} tone="rose" />
				<Tile label="Rejected Vendors" value={stats.rejected_vendors} icon={<AlertTriangle size={18} />} tone="slate" />
				<Tile label="Price Flags Today" value={stats.price_flags_today} icon={<BarChart3 size={18} />} tone="amber" />
				<Tile label="Total Reviews" value={stats.total_reviews} icon={<BarChart3 size={18} />} tone="green" sublabel={`Average rating ${stats.average_rating.toFixed(2)}`} />
			</section>

			<section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
				<div className="xl:col-span-2">
					<AdminActivityChart data={activity_trend} />
				</div>

				<div>
					<AdminModerationMixChart
						verified={stats.verified_vendors}
						pending={stats.pending_vendors}
						rejected={stats.rejected_vendors}
						suspended={stats.suspended_vendors}
					/>
				</div>
			</section>

			<div className="mt-6">
				<VendorRankingSwitcher
					topRatedVendors={top_rated_vendors}
					leastRatedVendors={least_rated_vendors}
				/>
			</div>

			<section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="text-xs font-bold uppercase tracking-widest text-slate-500">Recent admin signals</p>
						<h3 className="mt-2 text-xl font-bold text-slate-900">Recent activity</h3>
					</div>
					<div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
						{recent_activity.length} events
					</div>
				</div>

				<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
					{recent_activity.slice(0, 4).map((item) => (
						<div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
							<p className="text-sm font-semibold text-slate-900">{item.action.replace(/_/g, " ")}</p>
							<p className="mt-1 text-sm text-slate-500">{item.actor_name || "System"} · {item.resource}</p>
						</div>
					))}
				</div>
			</section>
		</AdminPanelShell>
	);
}

function Tile({ label, value, icon, tone, sublabel }: { label: string; value: number; icon: React.ReactNode; tone: "slate" | "green" | "blue" | "amber" | "rose"; sublabel?: string }) {
	const toneClasses = {
		slate: "bg-slate-50 text-slate-900 border-slate-200",
		green: "bg-emerald-50 text-emerald-700 border-emerald-100",
		blue: "bg-sky-50 text-sky-700 border-sky-100",
		amber: "bg-amber-50 text-amber-700 border-amber-100",
		rose: "bg-rose-50 text-rose-700 border-rose-100",
	}[tone];

	return (
		<div className={["rounded-2xl border p-5 shadow-sm", toneClasses].join(" ")}>
			<div className="flex items-center justify-between gap-3">
				<p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
				<div className="rounded-full bg-white/70 p-2">{icon}</div>
			</div>
			<p className="mt-3 text-3xl font-black tracking-tight">{value.toLocaleString("en-ET")}</p>
			{sublabel ? <p className="mt-1 text-xs font-medium opacity-70">{sublabel}</p> : null}
		</div>
	);
}

