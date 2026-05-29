"use client";

import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { registerVendor, setStoredVendorId, VendorApiError } from "../_lib/vendor-api";

interface RegisterForm {
  shop_name: string;
  city: string;
  address: string;
  contact_phone: string;
  latitude: string;
  longitude: string;
}

const INITIAL_FORM: RegisterForm = {
  shop_name: "",
  city: "",
  address: "",
  contact_phone: "",
  latitude: "",
  longitude: "",
};

export default function VendorRegisterPage() {
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await registerVendor({
        shop_name: form.shop_name,
        city: form.city,
        address: form.address,
        contact_phone: form.contact_phone,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      });

      const vendorId = String(response.id ?? response.vendor_id ?? "");
      if (vendorId) {
        setStoredVendorId(vendorId);
      }

      setSuccessMessage(vendorId ? `Vendor registered. Saved vendor id: ${vendorId}` : "Vendor registered successfully.");
    } catch (error) {
      if (error instanceof VendorApiError) {
        if (error.status === 401 || error.status === 403) {
          setErrorMessage("You must sign in first. Open Sign In, login, then submit this form again.");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("Unable to register vendor right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#111318] antialiased">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-white/80 px-8 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[#135bec]">SpendSense</span>
          <span className="rounded-full bg-[#e2e6ff] px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#00174c]">
            Vendor Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-500 transition-colors hover:text-[#135bec]" type="button">
            <HelpCircle size={18} />
          </button>
          <div className="h-8 w-px bg-slate-300/50" />
          <Link className="text-sm font-medium text-slate-500 transition-all hover:text-[#135bec]" href="/login">
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center justify-start px-4 pb-24 pt-12 sm:px-6">
        <div className="mb-12 w-full max-w-3xl text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Join the SpendSense Ecosystem</h1>
          <p className="text-lg text-slate-500">Set up your vendor account to start managing orders across Ethiopia.</p>
        </div>

        <div className="w-full max-w-2xl">
          <div className="overflow-hidden rounded-xl bg-white p-8 shadow-sm sm:p-10">
            <form className="space-y-8" onSubmit={onSubmit}>
              <div className="border-t border-slate-300/60 pt-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-[#e2e6ff] p-2">
                    <span className="text-[#135bec]">🏪</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Vendor Registration</h2>
                    <p className="text-sm text-slate-500">Fill the exact backend fields required to create your vendor profile.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec]/20 sm:col-span-2"
                      placeholder="Shop Name"
                      required
                      type="text"
                      value={form.shop_name}
                      onChange={(event) => setForm((prev) => ({ ...prev, shop_name: event.target.value }))}
                    />
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="City"
                      required
                      type="text"
                      value={form.city}
                      onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    />
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="Contact Phone"
                      required
                      type="text"
                      value={form.contact_phone}
                      onChange={(event) => setForm((prev) => ({ ...prev, contact_phone: event.target.value }))}
                    />
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec]/20 sm:col-span-2"
                      placeholder="Address"
                      required
                      type="text"
                      value={form.address}
                      onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                    />
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="Latitude (optional)"
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(event) => setForm((prev) => ({ ...prev, latitude: event.target.value }))}
                    />
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="Longitude (optional)"
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(event) => setForm((prev) => ({ ...prev, longitude: event.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <button
                  className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-500 transition-colors hover:text-slate-800"
                  type="button"
                  onClick={() => {
                    setForm(INITIAL_FORM);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                >
                  <ArrowLeft size={14} />
                  Reset
                </button>
                <button
                  className="flex items-center gap-2 rounded-xl bg-[#135bec] px-10 py-3 font-bold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Register Vendor"}
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>

            {successMessage ? (
              <p className={[
                "mt-4 rounded-lg p-3 text-sm",
                "bg-emerald-50 text-emerald-700",
              ].join(" ")}>{successMessage}</p>
            ) : null}
            {errorMessage ? <p className="mt-2 text-xs text-slate-500">{errorMessage}</p> : null}
          </div>

          <div className="mt-8 flex gap-4 rounded-xl border border-slate-300/30 bg-[#e2e6ff]/20 p-4">
            <Info className="text-[#135bec]" size={18} />
            <div>
              <h4 className="text-sm font-bold text-[#00174c]">Why we need this</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#00174c]/80">
                We verify tax status to ensure smooth fund settlements and VAT compliance.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed -left-20 top-32 -z-10 h-64 w-64 rounded-full bg-[#135bec]/5 blur-3xl" />
      <div className="fixed -right-20 bottom-10 -z-10 h-96 w-96 rounded-full bg-[#485c9a]/5 blur-3xl" />

      <footer className="mt-auto border-t border-slate-300/20 py-8 text-center text-slate-500">
        <p className="text-xs font-medium tracking-tight">© 2024 SpendSense Ethiopia. All rights reserved.</p>
      </footer>
    </div>
  );
}
