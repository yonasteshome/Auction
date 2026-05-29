import { type PriceSubmissionResponse } from "@/types/api/product-details";
import { MapPin, BarChart2 } from "lucide-react";

interface PriceSubmissionsProps {
  submissions: PriceSubmissionResponse[];
}

export function PriceSubmissions({ submissions }: PriceSubmissionsProps) {
  if (submissions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#111318] dark:text-white">Community Prices</h3>
          <p className="text-sm text-[#616f89] mt-1">Average prices by city</p>
        </div>
      </div>

      {/* Added max-h, overflow-y-auto, and custom scrollbar styling */}
      <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {submissions.map((submission) => {
          const price = parseFloat(submission.average_price);
          // Use first letter of city as avatar initial
          const initial = submission.city.charAt(0).toUpperCase();

          return (
            <div key={`${submission.item_id}-${submission.city}`} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="h-10 w-10 rounded-full bg-[#135bec]/10 text-[#135bec] flex items-center justify-center font-black text-sm shrink-0">
                {initial}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-sm text-[#111318] dark:text-white truncate">{submission.city}</span>
                  </div>
                  <span className="font-black text-[#111318] dark:text-white whitespace-nowrap">
                    {price.toFixed(2)} <span className="text-[10px] text-[#616f89]">ETB</span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-[#616f89]">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {submission.source === 'crowdsourced' ? 'Community' : 'Official'}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart2 size={12} /> {submission.count} {submission.count === 1 ? 'report' : 'reports'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}