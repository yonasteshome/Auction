"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { LogIn, Mail, Wallet } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { getDefaultRouteForRole, sanitizeReturnTo } from "@/lib/auth-constants";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { getAuthErrorStatus } from "@/lib/auth-types";
import { loginSchema, type LoginSchema } from "@/lib/validation/auth-schemas";
import { createZodResolver } from "@/lib/validation/zod-resolver";
import { useAuth } from "@/providers/auth-provider";

function LoginPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const rawReturnTo = searchParams.get("returnTo");
	const returnTo = useMemo(
		() => sanitizeReturnTo(rawReturnTo),
		[rawReturnTo],
	);
	const { signIn } = useAuth();
	const form = useForm<LoginSchema>({
		resolver: createZodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (values: LoginSchema) => {
		setError(null);

		try {
			const currentUser = await signIn({ email: values.email.trim(), password: values.password });
			const fallbackRoute = getDefaultRouteForRole(currentUser.role);
			let nextRoute = rawReturnTo ? returnTo : fallbackRoute;
			if (
				currentUser.role === "user" &&
				!currentUser.onboarding_completed &&
				!rawReturnTo
			) {
				nextRoute = "/onboarding";
			}
			router.replace(nextRoute);
		} catch (err) {
			if (getAuthErrorStatus(err) === 401) {
				setError("Incorrect email or password.");
			} else {
				setError("Unable to sign in right now. Please try again.");
			}
		}
	};

	return (
		<div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-border/50 bg-background shadow-xl">
			<div className="grid md:grid-cols-[1fr_1.35fr]">
				<section className="relative hidden min-h-135 flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
					<div className="space-y-5">
						<div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
							<Wallet className="size-4" />
							MarketSight Ethiopia
						</div>
						<div className="space-y-3">
							<h1 className="text-4xl font-bold leading-tight">Smart spending starts here.</h1>
							<p className="max-w-sm text-base text-primary-foreground/90">
								Track costs, compare prices, and make better money decisions every day.
							</p>
						</div>
					</div>
					<p className="text-sm text-primary-foreground/85">Trusted by thousands of Ethiopian households.</p>
				</section>

				<section className="flex items-center justify-center bg-background px-6 py-10 sm:px-10">
					<div className="w-full max-w-md space-y-6">
						<div className="space-y-2 text-center">
							<h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
							<p className="text-sm text-muted-foreground">Track your spending and shop smarter.</p>
						</div>

						{error && <AuthFeedback title="Sign in failed" message={error} variant="destructive" />}

						<Form {...form}>
							<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email address</FormLabel>
											<FormControl>
												<div className="relative">
													<Input id="email" type="email" autoComplete="email" placeholder="example@email.com" {...field} />
													<Mail className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<div className="flex items-center justify-between">
												<FormLabel>Password</FormLabel>
												<Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
													Forgot Password?
												</Link>
											</div>
											<FormControl>
												<Input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button className="h-12 w-full gap-2 text-base font-semibold" disabled={form.formState.isSubmitting} type="submit">
									<LogIn className="size-4" />
									{form.formState.isSubmitting ? "Signing in..." : "Sign In"}
								</Button>
							</form>
						</Form>

						<p className="text-center text-sm text-muted-foreground">
							Don&apos;t have an account?{" "}
							<Link href="/register" className="font-semibold text-primary hover:underline">
								Create an account
							</Link>
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={
			<div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-border/50 bg-background shadow-xl p-12 flex items-center justify-center min-h-[500px]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		}>
			<LoginPageContent />
		</Suspense>
	);
}
