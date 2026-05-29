"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { resetPasswordSchema, type ResetPasswordSchema } from "@/lib/validation/auth-schemas";
import { createZodResolver } from "@/lib/validation/zod-resolver";
import { useAuth } from "@/providers/auth-provider";

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirmPasswordReset } = useAuth();
  const form = useForm<ResetPasswordSchema>({
    resolver: createZodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const uid = useMemo(() => searchParams.get("uid") || "", [searchParams]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (values: ResetPasswordSchema) => {
    setError(null);

    if (!token || !uid) {
      setError("Reset link is missing uid or token. Open the link from your email again.");
      return;
    }

    try {
      await confirmPasswordReset(uid, token, values.password);
      setIsSubmitted(true);
      router.push("/login");
    } catch {
      setError("Unable to reset your password. The link may be expired.");
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      description="Choose a new password to continue using your account."
      footer={
        <p className="text-sm text-muted-foreground">
          Need a new reset link?{" "}
          <Link href="/forgot-password" className="text-foreground underline underline-offset-4">
            Request one
          </Link>
        </p>
      }
    >
      {error && (
        <AuthFeedback
          title="Reset failed"
          message={error}
          variant="destructive"
        />
      )}

      {isSubmitted && (
        <AuthFeedback
          title="Password updated"
          message="Your password has been reset. Redirecting to sign in."
        />
      )}

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Updating password..." : "Update password"}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-[450px] overflow-hidden rounded-2xl border border-border/50 bg-background shadow-xl p-12 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
