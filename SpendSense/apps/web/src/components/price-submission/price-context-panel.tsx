"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import type { ItemAveragesResponse } from "@/types/api/price-submissions";

interface PriceContextPanelProps {
  averages: ItemAveragesResponse | null;
  loading?: boolean;
  itemName?: string;
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#616f89]">{label}</span>
      <span className="font-bold text-[#111318]">
        {Number(value).toLocaleString()} ETB
      </span>
    </div>
  );
}

export function PriceContextPanel({
  averages,
  loading,
  itemName,
}: PriceContextPanelProps) {
  return (
    <section className="rounded-xl border border-[#cbd5e1]/30 bg-white p-6 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 font-bold text-[#111318]">
        <BarChart3 className="size-5 text-[#135bec]" />
        Price context
      </h4>
      {loading && (
        <p className="text-sm text-[#616f89]">Loading averages…</p>
      )}
      {!loading && !averages && (
        <p className="text-sm text-[#616f89]">
          Select an item to see community averages.
        </p>
      )}
      {!loading && averages && (
        <div className="space-y-4">
          {itemName && (
            <p className="text-xs font-bold uppercase tracking-wider text-[#616f89]">
              {itemName}
            </p>
          )}
          <div className="space-y-2 rounded-lg bg-[#f0f2f4] p-3">
            <StatRow label="National avg" value={averages.national_average} />
            <StatRow label="City avg" value={averages.city_average} />
            <StatRow
              label="This market avg"
              value={averages.location_average}
            />
          </div>
          {averages.recent_submissions.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase text-[#616f89]">
                <TrendingUp className="size-3.5" />
                Recent submissions
              </p>
              <ul className="space-y-2">
                {averages.recent_submissions.map((s, i) => (
                  <li
                    key={`${s.date}-${i}`}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-[#616f89]">
                      {s.location} · {s.date}
                    </span>
                    <span className="font-semibold">
                      {Number(s.price).toLocaleString()} ETB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-[#616f89]">
            Based on {averages.total_submissions} approved submissions.
          </p>
        </div>
      )}
    </section>
  );
}
