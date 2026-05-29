"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default function SecuritySettingsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold">Security Settings</h1>
        <p className="text-sm text-slate-500">Manage your account security credentials.</p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
