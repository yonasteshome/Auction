"use client";

import { approveVendor, rejectVendor, suspendVendor } from "@/actions/admin/vendor-actions";
import { AdminVendor } from "@/types/api/admin-vendors";
import { formatDistanceToNow } from "date-fns";
import { Calendar, CheckCircle2, FileText, Mail, MapPin, Phone, ShieldAlert, Store, User as UserIcon, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VerificationQueueProps {
  initialVendors: AdminVendor[];
}

export default function VerificationQueue({ initialVendors }: VerificationQueueProps) {
  const [vendors, setVendors] = useState<AdminVendor[]>(initialVendors);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVendor = vendors[selectedIndex];

  async function handleApprove() {
    if (!selectedVendor) return;
    setIsSubmitting(true);
    const res = await approveVendor(selectedVendor.id);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Vendor approved successfully");
      const newVendors = vendors.filter((_, i) => i !== selectedIndex);
      setVendors(newVendors);
      setSelectedIndex(0);
    } else {
      toast.error(res.message);
    }
  }

  async function handleReject() {
    if (!selectedVendor) return;
    if (!reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setIsSubmitting(true);
    const res = await rejectVendor(selectedVendor.id, reason);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Vendor rejected");
      const newVendors = vendors.filter((_, i) => i !== selectedIndex);
      setVendors(newVendors);
      setSelectedIndex(0);
      setReason("");
    } else {
      toast.error(res.message);
    }
  }

  async function handleSuspend() {
    if (!selectedVendor) return;
    if (!reason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }
    setIsSubmitting(true);
    const res = await suspendVendor(selectedVendor.id, reason);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Vendor suspended");
      const newVendors = vendors.filter((_, i) => i !== selectedIndex);
      setVendors(newVendors);
      setSelectedIndex(0);
      setReason("");
    } else {
      toast.error(res.message);
    }
  }

  if (vendors.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
        <p className="mt-2 text-slate-500">There are no pending vendor verification requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="space-y-4 lg:col-span-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Pending Queue ({vendors.length})
          </h3>
          <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
            Action Required
          </span>
        </div>
        <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {vendors.map((vendor, idx) => (
            <article
              key={vendor.id}
              onClick={() => {
                setSelectedIndex(idx);
                setReason("");
              }}
              className={[
                "cursor-pointer rounded-xl p-5 shadow-sm transition-all duration-200 border-2",
                idx === selectedIndex 
                  ? "border-blue-600 bg-white shadow-md ring-1 ring-blue-100" 
                  : "border-transparent bg-slate-50 hover:bg-slate-100",
              ].join(" ")}
            >
              <div className="mb-2 flex items-start justify-between">
                <h4 className="font-bold text-slate-900 line-clamp-1">{vendor.shop_name}</h4>
                {idx === selectedIndex && (
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} /> {vendor.city}
              </div>
              <p className="mt-3 text-[11px] font-medium text-slate-400 italic">
                Applied {formatDistanceToNow(new Date(vendor.joined_at))} ago
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6 lg:col-span-8">
        <article className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
          <div className="border-b border-slate-100 bg-blue-50/40 px-8 py-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white border border-blue-100 shadow-sm">
                <Store className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedVendor.shop_name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={14} className="text-blue-500" /> {selectedVendor.address || selectedVendor.city}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-y-8 gap-x-12 p-8 md:grid-cols-2">
            <InfoRow icon={<UserIcon size={14}/>} label="Owner Name" value={selectedVendor.owner_name} />
            <InfoRow icon={<FileText size={14}/>} label="Business TIN" value={selectedVendor.tin_number} mono />
            <InfoRow icon={<Mail size={14}/>} label="Email" value={selectedVendor.owner_email} />
            <InfoRow icon={<Phone size={14}/>} label="Phone" value={selectedVendor.contact_phone} />
            <InfoRow icon={<Calendar size={14}/>} label="Joined Date" value={new Date(selectedVendor.joined_at).toLocaleDateString()} />
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Business License</p>
              {selectedVendor.business_license ? (
                <a 
                  href={selectedVendor.business_license} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <FileText size={16} /> View Document
                </a>
              ) : (
                <span className="text-sm font-medium text-slate-400 italic">No license uploaded</span>
              )}
            </div>
          </div>
        </article>

        <article className="rounded-xl bg-white p-8 shadow-sm border border-slate-100">
          <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-blue-600" /> Verification Action
          </h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Reviewer Notes / Rejection Reason / Suspension Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-32 w-full resize-none rounded-xl border-none bg-slate-100 p-4 text-sm focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Reason for rejection or suspension..."
              />
            </div>
            <div className="flex flex-col justify-end gap-3">
              <button 
                onClick={handleSuspend}
                disabled={isSubmitting}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-amber-100 bg-amber-50 px-6 py-3.5 font-bold text-amber-700 hover:bg-amber-100 hover:border-amber-200 transition-all disabled:opacity-50"
              >
                <ShieldAlert size={18} className="group-hover:scale-110 transition-transform" /> 
                Suspend Vendor
              </button>
              <button 
                onClick={handleReject}
                disabled={isSubmitting}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-red-100 px-6 py-3.5 font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50"
              >
                <XCircle size={18} className="group-hover:rotate-90 transition-transform" /> 
                Reject Application
              </button>
              <button 
                onClick={handleApprove}
                disabled={isSubmitting}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50"
              >
                <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" /> 
                {isSubmitting ? "Processing..." : "Approve Registration"}
              </button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function InfoRow({ label, value, mono, icon }: { label: string; value: string; mono?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="group">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className={["font-semibold text-slate-900 group-hover:text-blue-700 transition-colors", mono ? "font-mono" : ""].join(" ")}>{value || "N/A"}</p>
    </div>
  );
}
