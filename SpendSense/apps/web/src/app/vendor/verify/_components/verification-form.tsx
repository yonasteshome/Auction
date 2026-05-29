"use client";

import { useState, lazy, Suspense } from "react";
import { ShieldCheck, FileText, Hash, Loader2, MapPin, Clock } from "lucide-react";
import { requestVerification } from "@/actions/vendor/requestVerification";
import { toast } from "sonner";
import Link from "next/link";
import { BusinessHoursEditor, type BusinessHourEntry } from "@/components/shared/business-hours-editor";

const LocationPicker = lazy(() => import("@/components/shared/location-picker"));

const CITY_OPTIONS = ["Addis Ababa", "Adama"] as const;

export function VerificationForm() {
  const [isPending, setIsPending] = useState(false);
  const [city, setCity] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHourEntry[]>([]);
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  async function handleSubmit(formData: FormData) {
    // Append new fields to the FormData
    if (city) formData.append("city", city);
    if (latitude != null) formData.append("latitude", String(latitude));
    if (longitude != null) formData.append("longitude", String(longitude));
    if (businessHours.length > 0) {
      formData.append("business_hours", JSON.stringify(businessHours));
    }

    setIsPending(true);
    try {
      const result = await requestVerification(formData);
      console.log(result);
      if (result.success) {
        toast.success("Verification request submitted successfully!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <div className="mx-auto w-20 h-20 bg-blue-100 text-[#135bec] rounded-full flex items-center justify-center mb-6">
        <ShieldCheck size={40} />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Verify Your Business</h1>
      <p className="text-slate-500 mb-8 text-lg leading-relaxed">
        Please provide your business documentation and details to complete the verification process and start selling.
      </p>

      <form action={handleSubmit} className="text-left space-y-6">
        {/* TIN Number */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Hash size={16} className="text-[#135bec]" />
            TIN Number
          </label>
          <input
            required
            name="tin_number"
            placeholder="Enter your Tax Identification Number"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-[#135bec] focus:bg-white transition-all disabled:opacity-50"
            disabled={isPending}
          />
        </div>

        {/* Business License */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText size={16} className="text-[#135bec]" />
            Business License (PDF or Image)
          </label>
          <div className="relative">
            <input
              required
              type="file"
              name="business_license"
              accept=".pdf,image/*"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#135bec] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
              disabled={isPending}
            />
          </div>
          <p className="text-[10px] text-slate-400">Accepted formats: PDF, PNG, JPG (Max 5MB)</p>
        </div>

        {/* City Select */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin size={16} className="text-[#135bec]" />
            City
          </label>
          <select
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-[#135bec] focus:bg-white transition-all disabled:opacity-50"
            disabled={isPending}
          >
            <option value="">Select your city</option>
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Business Hours */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Clock size={16} className="text-[#135bec]" />
            Business Hours
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <BusinessHoursEditor value={businessHours} onChange={setBusinessHours} />
          </div>
        </div>

        {/* Location Picker */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin size={16} className="text-[#135bec]" />
            Business Location
          </label>
          <p className="text-xs text-slate-400">
            Click on the map, drag the marker, or use your device&apos;s GPS to set your shop location.
            You can also type coordinates manually.
          </p>
          <Suspense
            fallback={
              <div className="h-[280px] rounded-xl bg-slate-100 flex items-center justify-center text-sm text-slate-400 animate-pulse">
                Loading map...
              </div>
            }
          >
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
          </Suspense>
        </div>

        {/* Submit */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/vendor/profile"
            className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-2xl bg-[#135bec] px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 min-w-[200px]"
          >
            {isPending ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Verification"
            )}
          </button>
        </div>
      </form>
    </>
  );
}
