import AdminPanelShell from "../_components/admin-panel-shell";
import { getPendingVendors } from "@/lib/admin/vendors";
import VerificationQueue from "./_components/verification-queue";
import { Suspense } from "react";

export const metadata = {
  title: "Vendor Verification | SpendSense Admin",
  description: "Review and approve vendor business registrations.",
};

export default async function VendorVerificationPage() {
  const { results: pendingVendors } = await getPendingVendors();

  return (
    <AdminPanelShell
      activeTab="verification"
      subtitle="Review and approve new vendor business registrations for the Ethiopian market."
      title="Vendor Verification"
    >
      <Suspense fallback={<VerificationQueueSkeleton />}>
        <VerificationQueue initialVendors={pendingVendors} />
      </Suspense>
    </AdminPanelShell>
  );
}

function VerificationQueueSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-pulse">
      <section className="space-y-4 lg:col-span-4">
        <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl" />
        ))}
      </section>
      <section className="space-y-6 lg:col-span-8">
        <div className="h-64 bg-slate-100 rounded-xl" />
        <div className="h-48 bg-slate-100 rounded-xl" />
      </section>
    </div>
  );
}
