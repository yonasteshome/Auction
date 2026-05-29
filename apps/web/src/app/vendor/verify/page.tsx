import { getVerificationStatus } from "@/actions/vendor/getVerificationStatus";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { VerificationForm } from "./_components/verification-form";

export const dynamic = "force-dynamic";

export default async function VendorVerifyPage() {
  const status = await getVerificationStatus();

  const vStatus = status?.verification_status || 'unrequested';
  const isVerified = status?.is_verified ?? false;

  return (
    <main className="min-h-[calc(100vh-64px)] p-4 md:ml-64 md:p-8 flex items-center justify-center bg-[#f6f6f8]">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/60">
          <div className="p-8 md:p-12 text-center">
            {isVerified || vStatus === 'verified' ? (
              <>
                <div className="mx-auto w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Account Verified</h1>
                <p className="text-slate-500 mb-10 text-lg leading-relaxed">
                  Congratulations! Your business account has been verified. You can now list products and receive orders in the marketplace.
                </p>
                <Link 
                  href="/vendor/dashboard"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#135bec] px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : vStatus === 'requested'? (
              <>
                <div className="mx-auto w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
                  <Clock size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Verification Pending</h1>
                <p className="text-slate-500 mb-8 text-lg leading-relaxed">
                  Your shop <span className="font-bold text-slate-800">"{status?.shop_name || "My Business"}"</span> is currently under review by our compliance team.
                </p>
                
                <div className="grid gap-4 text-left mb-10">
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-[#135bec] shrink-0"><CheckCircle2 size={24} /></div>
                    <div>
                      <p className="font-bold text-slate-900">Request Submitted</p>
                      <p className="text-sm text-slate-500">Your verification request and documents have been received.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200">
                    <div className="text-amber-500 shrink-0"><AlertCircle size={24} /></div>
                    <div>
                      <p className="font-bold text-slate-900">Document Review</p>
                      <p className="text-sm text-slate-500">We are currently verifying your business license and TIN details.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/vendor/profile"
                    className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
                  >
                    Update Profile
                  </Link>
                  <button 
                    disabled
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white opacity-50 cursor-not-allowed"
                  >
                    Awaiting Approval
                  </button>
                </div>
                
                <p className="mt-8 text-sm text-slate-400 italic">
                  Verification usually takes 24-48 business hours. You'll receive a notification once approved.
                </p>
              </>
            ) : vStatus === 'suspended' ? (
              <>
                <div className="mx-auto w-20 h-20 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center mb-6">
                  <ShieldAlert size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Account Suspended</h1>
                <p className="text-slate-500 mb-8 text-lg leading-relaxed">
                  Your vendor account has been suspended by an administrator. You can review the reason below and contact support if you need clarification.
                </p>
                {status?.verification_rejection_reason && (
                  <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-600">Suspension Note</p>
                    <p className="text-sm text-slate-700">{status.verification_rejection_reason}</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/vendor/profile"
                    className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
                  >
                    Review Profile
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
                  >
                    Go to User Dashboard
                  </Link>
                </div>
              </>
            ) : vStatus === 'rejected' ? (
              <>
                <div className="mx-auto w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Verification Rejected</h1>
                <p className="text-slate-500 mb-8 text-lg leading-relaxed">
                  We couldn't verify your business details. Please update your profile with accurate information and resubmit your documents.
                </p>
                {status?.verification_rejection_reason && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-red-600">Rejection Reason</p>
                    <p className="text-sm text-red-800">{status.verification_rejection_reason}</p>
                  </div>
                )}
                <div className="mb-10">
                   <VerificationForm />
                </div>
              </>
            ) : (
              <VerificationForm />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
