"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useAuth } from "@/providers/auth-provider";
import { updateProfile } from "@/services/userService";

export default function OnboardingPage() {
  const router = useRouter();
  const { accessToken, status } = useAuth();
  const [city, setCity] = useState("Addis Ababa");
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CITY_OPTIONS = ["Addis Ababa", "Adama"] as const;

  const onComplete = async () => {
    if (!accessToken) {
      setError("You need to be signed in.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProfile(accessToken, {
        city,
        notification_preferences: {
          price_alerts: priceAlerts,
          budget_alerts: budgetAlerts,
        },
        onboarding_completed: true,
      });
      router.replace("/dashboard");
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-80 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome to SpendSense</h1>
        <p className="mt-2 text-slate-600">Set your location and alert preferences to personalize your feed.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        <label className="text-sm font-medium">City</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-[#135bec] focus:bg-white transition-all"
        >
          {CITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Price spike alerts</span>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={priceAlerts}
            onChange={(e) => setPriceAlerts(e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Budget warnings (80% / 100%)</span>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={budgetAlerts}
            onChange={(e) => setBudgetAlerts(e.target.checked)}
          />
        </label>
      </div>

      <Button className="w-full" disabled={saving} onClick={() => void onComplete()}>
        {saving ? "Saving…" : "Continue to dashboard"}
      </Button>
    </div>
  );
}
