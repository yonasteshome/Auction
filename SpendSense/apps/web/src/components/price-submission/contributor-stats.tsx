import { Target, Trophy, Shield } from "lucide-react";
import type { ContributorStatsResponse } from "@/types/api/price-submissions";

interface ContributorStatsProps {
  stats: ContributorStatsResponse | null;
}

const BADGE_STYLES: Record<string, string> = {
  gold: "bg-amber-100 text-amber-900",
  silver: "bg-[#ffdbcf] text-[#380d00]",
  bronze: "bg-orange-100 text-orange-900",
};

export function ContributorStats({ stats }: ContributorStatsProps) {
  if (!stats) {
    return (
      <section className="rounded-xl border border-[#cbd5e1]/30 bg-white p-6 shadow-sm">
        <p className="text-sm text-[#616f89]">
          Sign in to see your contributor stats.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-[#cbd5e1]/30 bg-white p-6 shadow-sm">
        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#135bec]/5" />
        <div className="relative mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#135bec] bg-[#e2e6ff] text-[#135bec]">
            <Target size={24} />
          </div>
          <div>
            <h4 className="font-bold text-[#111318]">Your contribution</h4>
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${BADGE_STYLES[stats.badge_color] ?? BADGE_STYLES.bronze}`}
            >
              {stats.level}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex justify-between text-xs font-bold">
              <span className="text-[#616f89]">Rank progress</span>
              <span className="text-[#135bec]">{stats.rank_progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f2f4]">
              <div
                className="h-full bg-[#135bec] transition-all"
                style={{ width: `${stats.rank_progress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#f0f2f4] p-3">
              <p className="text-[10px] font-bold uppercase text-[#616f89]">
                Points
              </p>
              <p className="text-xl font-bold">{stats.points.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-[#f0f2f4] p-3">
              <p className="text-[10px] font-bold uppercase text-[#616f89]">
                Verified
              </p>
              <p className="text-xl font-bold">{stats.approved}</p>
            </div>
          </div>
          <p className="text-xs text-[#616f89]">
            Your submissions covered {stats.items_covered} items across{" "}
            {stats.markets_covered} markets.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-[#cbd5e1]/30 bg-[#135bec]/5 p-4">
        <p className="text-sm font-semibold text-[#111318]">
          {stats.total_week_submissions.toLocaleString()} prices submitted this
          week
        </p>
        <p className="mt-1 text-xs text-[#616f89]">
          You contributed {stats.week_submissions} this week — thank you!
        </p>
      </section>

      <section className="flex items-start gap-2 rounded-xl border border-[#cbd5e1]/30 bg-white p-4 text-xs text-[#616f89]">
        <Shield className="mt-0.5 size-4 shrink-0 text-[#135bec]" />
        <span>
          All submissions are verified by our moderation team before publishing.
        </span>
      </section>

      <section className="rounded-xl border border-[#cbd5e1]/30 bg-white p-6 shadow-sm">
        <h4 className="mb-2 flex items-center gap-2 font-bold text-[#111318]">
          <Trophy size={18} className="text-amber-500" />
          Earn badges
        </h4>
        <ul className="space-y-1 text-xs text-[#616f89]">
          <li>Price Spotter — 10 approved submissions</li>
          <li>Market Insider — 25 approved</li>
          <li>Community Champion — 100 approved</li>
        </ul>
      </section>
    </div>
  );
}
