"use client";

import React, { useState } from "react";
import { Loader2, ShieldCheck, BadgeCheck } from "lucide-react";
import type { UserProfile } from "@/services/userService";

export default function ProfileClient({
  initialUser,
  onSave,
}: {
  initialUser?: UserProfile | null;
  onSave: (body: Partial<UserProfile & { full_name: string }>) => Promise<UserProfile> | Promise<void>;
}) {
  const [form, setForm] = useState<Partial<UserProfile & { full_name: string }>>(
    initialUser
      ? {
          full_name: initialUser.full_name,
          city: initialUser.city ?? "",
          phone: initialUser.phone ?? "",
          household_size: initialUser.household_size ?? undefined,
          income_bracket: initialUser.income_bracket ?? "",
        }
      : {}
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const body = {
        full_name: form.full_name,
        city: form.city || null,
        phone: form.phone || null,
        household_size: form.household_size ?? null,
        income_bracket: form.income_bracket ?? null,
      };

      const updated = await onSave(body as any);

      if (updated && typeof updated === "object") {
        setForm({
          full_name: (updated as any).full_name,
          city: (updated as any).city ?? "",
          phone: (updated as any).phone ?? "",
          household_size: (updated as any).household_size ?? undefined,
          income_bracket: (updated as any).income_bracket ?? "",
        });
      }

      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: "Could not save. Check your network." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className=" bg-[#f6f6f8] text-[#111318] antialiased">
      <main className=" px-10  max-md:ml-0">
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex flex-col items-center rounded-xl bg-white p-8 shadow-sm text-center lg:w-1/3">
              <div className="relative mb-6">
                <div className="h-32 w-32 rounded-full p-1 ring-4 ring-[#135bec]/10">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#f0f2f4] text-3xl font-bold text-[#135bec]">
                    {form.full_name?.split(" ").map((n) => n[0]).join("")}
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 flex items-center justify-center rounded-full border-2 border-white bg-[#135bec] p-1 text-white">
                  <BadgeCheck size={16} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#111318]">{form.full_name || "New User"}</h2>
              <p className="mb-4 font-medium text-[#616f89]">{initialUser?.email}</p>

              {/* <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#e2e6ff] px-3 py-1 text-xs font-bold text-[#00174c]">
                <Loader2 className="mr-2 size-6 animate-spin text-[#135bec]" />
                PLATINUM TIER MEMBER
              </div> */}

              <div className="w-full space-y-4 border-t border-[#cbd5e1]/30 pt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#616f89]">Location</span>
                  <span className="font-semibold">{form.city || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#616f89]">Household</span>
                  <span className="font-semibold">{form.household_size || "—"} People</span>
                </div>
              </div>

              {/* <button className="mt-8 w-full rounded-xl bg-[#135bec] py-3 font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95">
                Upgrade Membership
              </button> */}
            </div>

            <div className="rounded-xl bg-white p-8 shadow-sm lg:w-2/3">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#111318]">Personal Information</h3>
                {message && (
                  <span className={`text-xs font-bold ${message.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
                    {message.text}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputGroup label="Full Name" value={form.full_name} onChange={(val) => setForm((f) => ({ ...f, full_name: val }))} />
                <InputGroup label="Phone Number" value={form.phone || ""} onChange={(val) => setForm((f) => ({ ...f, phone: val }))} />
                <InputGroup label="City" value={form.city || ""} onChange={(val) => setForm((f) => ({ ...f, city: val }))} />
                <InputGroup label="Income Bracket" placeholder="e.g. 5000-10000" value={form.income_bracket || ""} onChange={(val) => setForm((f) => ({ ...f, income_bracket: val }))} />

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#616f89]">Household Size</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 font-medium text-[#111318] focus:ring-2 focus:ring-[#135bec]"
                    value={form.household_size ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, household_size: parseInt(e.target.value) || undefined }))}
                  />
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-[#cbd5e1]/30 pt-8">
                <div className="flex items-center gap-4 text-[#616f89]">
                  <ShieldCheck className="text-[#135bec]" size={20} />
                  <span className="text-xs font-medium">Your data is encrypted and secure</span>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#135bec] px-8 py-3 font-bold text-white transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (val: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-wider text-[#616f89]">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 font-medium text-[#111318] focus:ring-2 focus:ring-[#135bec]"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
