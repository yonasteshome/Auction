"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { changePasswordSchema, type ChangePasswordSchema } from "@/lib/validation/auth-schemas";
import { createZodResolver } from "@/lib/validation/zod-resolver";
import { changePassword } from "@/actions/password-actions";
import { toast } from "sonner";
import { KeyRound, ShieldAlert } from "lucide-react";

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ChangePasswordSchema>({
    resolver: createZodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordSchema) => {
    setError(null);

    try {
      const result = await changePassword(values.currentPassword, values.newPassword);

      if (result.success) {
        toast.success("Password updated successfully");
        form.reset();
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <KeyRound className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Update Password</h3>
          <p className="text-xs text-slate-500">Secure your account by choosing a strong password.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          <ShieldAlert className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Current Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    className="w-full rounded-lg bg-[#f0f2f4] border-none px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    className="w-full rounded-lg bg-[#f0f2f4] border-none px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className="w-full rounded-lg bg-[#f0f2f4] border-none px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-[#135bec] hover:bg-[#135bec]/95 font-semibold text-white shadow-md transition-all active:scale-[0.98]"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Updating Password..." : "Update Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
