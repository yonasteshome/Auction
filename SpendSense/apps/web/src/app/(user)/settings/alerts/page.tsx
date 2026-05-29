"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useAuth } from "@/providers/auth-provider";
import { getCurrentUser, updateProfile } from "@/services/userService";

export default function SettingsAlertsPage() {
  const { accessToken, status } = useAuth();
  const [price, setPrice] = useState(true);
  const [budget, setBudget] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken || status !== "authenticated") {
      setLoading(false);
      return;
    }
    void getCurrentUser(accessToken)
      .then((u) => {
        const prefs = u.notification_preferences as Record<string, boolean> | undefined;
        if (prefs) {
          setPrice(prefs.price_alerts !== false);
          setBudget(prefs.budget_alerts !== false);
        }
      })
      .finally(() => setLoading(false));
  }, [accessToken, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-60 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Alert preferences</h1>
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="flex items-center justify-between text-sm">
          <span>Price alerts</span>
          <input type="checkbox" checked={price} onChange={(e) => setPrice(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span>Budget warnings</span>
          <input type="checkbox" checked={budget} onChange={(e) => setBudget(e.target.checked)} />
        </label>
      </div>
      <Button
        disabled={saving || !accessToken}
        onClick={async () => {
          if (!accessToken) return;
          setSaving(true);
          try {
            await updateProfile(accessToken, {
              notification_preferences: { price_alerts: price, budget_alerts: budget },
            });
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving…" : "Save preferences"}
      </Button>
    </div>
  );
}
