"use client"
import React, { FormEvent, useState, lazy, Suspense } from "react";
import type { VendorProfile, BusinessHourEntry } from "../_lib/vendor-api";
import { updateProfile } from "@/actions/vendor/updateProfile";
import { BusinessHoursEditor } from "@/components/shared/business-hours-editor";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

const LocationPicker = lazy(() => import("@/components/shared/location-picker"));

const CITY_OPTIONS = ["Addis Ababa", "Adama"] as const;

export default function VendorProfileClient({ initialProfile }: { initialProfile: VendorProfile | null }) {
  const [profile, setProfile] = useState<VendorProfile | null>(initialProfile);
  const [vendorId, setVendorId] = useState<string>(typeof window !== "undefined" ? localStorage.getItem("MarketSight_vendor_id") || "" : "");
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialProfile?.image_url || initialProfile?.image || null);

  // Business hours state
  const [businessHours, setBusinessHours] = useState<BusinessHourEntry[]>(
    initialProfile?.business_hours ?? []
  );

  // Location state
  const [latitude, setLatitude] = useState<number | undefined>(initialProfile?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialProfile?.longitude);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      // User fields
      formData.append("full_name", profile.full_name || "");
      formData.append("phone", profile.phone || "");
      formData.append("city", profile.city || "");
      if (profile.income_bracket) formData.append("income_bracket", profile.income_bracket);
      if (profile.household_size) formData.append("household_size", String(profile.household_size));

      // Vendor fields
      if (profile.shop_name) formData.append("shop_name", profile.shop_name);
      if (profile.address) formData.append("address", profile.address);
      if (profile.contact_phone) formData.append("contact_phone", profile.contact_phone);
      if (imageFile) formData.append("image", imageFile);

      // New fields
      if (latitude != null) formData.append("latitude", String(latitude));
      if (longitude != null) formData.append("longitude", String(longitude));
      if (businessHours.length > 0) {
        formData.append("business_hours", JSON.stringify(businessHours));
      }

      const result = await updateProfile(formData);

      if (result.success) {
        setProfile(result.data);

        const vid = result.data.vendor_info?.id || result.data.vendor_info?.vendor_id;
        if (vid) {
          const vendorIdStr = String(vid);
          localStorage.setItem("MarketSight_vendor_id", vendorIdStr);
          setVendorId(vendorIdStr);
        }

        setMessage("Profile and business details updated successfully.");
      } else {
        setError(result.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div>
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex items-start gap-6">
          <div className="group relative">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-4 ring-white">
              <img
                alt="Business logo"
                className="h-full w-full object-cover"
                src={imagePreview || "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=240&h=240&fit=crop"}
              />
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-[10px] font-bold text-white uppercase">Change Logo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight">{profile?.full_name || "Vendor"}</h2>
            </div>
            <p className="mt-2 max-w-xl text-slate-500">Business profile information.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            form="vendor-profile-form"
            className="rounded-xl bg-[#135bec] px-6 py-2.5 font-semibold text-white shadow-md transition-transform active:scale-95"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {loading ? <p className="mb-4 text-sm text-slate-600">Loading profile...</p> : null}
      {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

      <div className="grid grid-cols-12 gap-6">
        <form id="vendor-profile-form" onSubmit={onSave} className="col-span-12 space-y-6 lg:col-span-8">
          {/* Basic Info Section */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-lg font-bold">Business Profile Details</h3>
              <span className="text-xs font-bold uppercase tracking-wider text-[#135bec]">Editable Section</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Official Business Name</label>
                <input
                  className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                  onChange={(event) => setProfile((prev) => (prev ? { ...prev, shop_name: event.target.value } : prev))}
                  type="text"
                  value={profile?.shop_name || ""}
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Owner Name</label>
                <input
                  className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                  onChange={(event) => setProfile((prev) => (prev ? { ...prev, full_name: event.target.value } : prev))}
                  type="text"
                  value={profile?.full_name || ""}
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Business Category</label>
                <select className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20">
                  <option>Logistics &amp; Supply Chain</option>
                  <option>Manufacturing</option>
                  <option>Retail Distribution</option>
                </select>
              </div>

              {/* City Select */}
              <div className="col-span-2 md:col-span-1">
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">City</label>
                <select
                  className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                  value={profile?.city || ""}
                  onChange={(event) => setProfile((prev) => (prev ? { ...prev, city: event.target.value } : prev))}
                >
                  <option value="">Select City</option>
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Business Description / Address</label>
                <textarea
                  className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                  rows={4}
                  placeholder="Describe your business or add your physical address..."
                  value={profile?.address || ""}
                  onChange={(event) => setProfile((prev) => (prev ? { ...prev, address: event.target.value } : prev))}
                />
              </div>

              <div className="col-span-1">
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Phone</label>
                <input
                  className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                  onChange={(event) => setProfile((prev) => (prev ? { ...prev, contact_phone: event.target.value } : prev))}
                  type="text"
                  value={profile?.contact_phone || profile?.phone || ""}
                />
              </div>
            </div>
          </section>

          {/* Business Hours Section */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">Business Hours</h3>
              <span className="text-xs font-bold uppercase tracking-wider text-[#135bec]">Schedule</span>
            </div>
            <BusinessHoursEditor value={businessHours} onChange={setBusinessHours} />
          </section>

          {/* Location Section */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">Business Location</h3>
              <span className="text-xs font-bold uppercase tracking-wider text-[#135bec]">Map</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Click on the map, drag the marker, or use your device location to set your shop&apos;s coordinates. You can also enter latitude and longitude manually.
            </p>
            <Suspense
              fallback={
                <div className="h-[280px] rounded-xl bg-[#f0f2f4] flex items-center justify-center text-sm text-slate-400 animate-pulse">
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
          </section>
        </form>

        <div className="col-span-12 space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-sm font-bold">Client Trust Metrics</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-extrabold">4.9 / 5.0</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Satisfaction rate</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-[#135bec]">124</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Contracts Fulfilled</p>
                </div>
              </div>
            </div>
          </div>

          <ChangePasswordForm />

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
            Stored vendor id: <span className="font-semibold text-slate-700">{vendorId || "Not found"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
