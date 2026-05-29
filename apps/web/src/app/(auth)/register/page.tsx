"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { Mail, UserRound, Wallet } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { getAuthErrorStatus } from "@/lib/auth-types";
import { registerSchema, type RegisterSchema } from "@/lib/validation/auth-schemas";
import { createZodResolver } from "@/lib/validation/zod-resolver";
import { useAuth } from "@/providers/auth-provider";

export default function RegisterPage() {
	const router = useRouter();
	const { signUp } = useAuth();
  const form = useForm<RegisterSchema>({
		resolver: createZodResolver(registerSchema),
    defaultValues: {
			role: "User",
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
			acceptTerms: false,
    },
  });

	const [error, setError] = useState<string | null>(null);
	const selectedRole = useWatch({ control: form.control, name: "role" });

	const onSubmit = async (values: RegisterSchema) => {
		setError(null);

		try {
			await signUp({
				full_name: values.full_name.trim(),
				email: values.email.trim(),
				password: values.password,
				role: values.role === "Vendor" ? "vendor" : "user",
			});

			router.push("/login?returnTo=/onboarding");
		} catch (err) {
			if (getAuthErrorStatus(err) === 400) {
				setError("Please review your details and try again.");
			} else {
				setError("Unable to create your account right now. Please try again.");
			}
		}
	};

	return (
		<div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-border/50 bg-background shadow-xl">
			<div className="grid md:grid-cols-[1fr_1.35fr]">
				<section
					className="relative hidden min-h-140 flex-col justify-between bg-primary p-10 text-primary-foreground md:flex"
					style={{
						backgroundImage:
							"linear-gradient(rgba(19,91,236,0.9),rgba(19,91,236,0.9)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCKr8hpjpHCl4RHpwWMARd39MqEniwNcMgISdbBZQisP260CevTUxUSNG9SCmC_jejsJ8uEh6fcocAL9TUckohjnql6qOLSkSMoWyw1TowWu7W4Iaijk2lrYYJuljNYJRtSuO3ycQCROC0EViwk8lLALdL51hIQPSBgYw9S8frFiqT0T66kmLOLFtHAx7f-IlYXVOSAxXbG9gh-TIQeMYmbdaxX8j9a0Usd4cgXxP55s-f_20Y5NWDgbZDbkePYJ-PRdW__vhLRE_g')",
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				>
					<div className="space-y-5">
						<div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
							<Wallet className="size-4" />
							SpendSense Ethiopia
						</div>
						<div className="space-y-3">
							<h1 className="text-4xl font-bold leading-tight">Master your money in Ethiopia.</h1>
							<p className="max-w-sm text-base text-primary-foreground/90">
								Join thousands of users tracking daily costs, comparing market prices, and budgeting smarter.
							</p>
						</div>
					</div>
					<p className="text-sm text-primary-foreground/85">Trusted by 10k+ locals</p>
				</section>

				<section className="flex items-center justify-center bg-background px-6 py-10 sm:px-10">
					<div className="w-full max-w-md space-y-6">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
							<p className="text-sm text-muted-foreground">Start tracking expenses and shopping smarter today.</p>
						</div>

						{error && <AuthFeedback title="Registration failed" message={error} variant="destructive" />}

						<Form {...form}>
							<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
								<FormField
									control={form.control}
									name="role"
									render={({ field }) => (
										<FormItem>
											<FormLabel>I am a...</FormLabel>
											<FormControl>
												<div className="flex h-12 w-full items-center justify-center rounded-lg bg-muted p-1">
													<label
														className={[
															"group flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 transition-all",
															selectedRole === "User" ? "bg-background shadow-sm text-primary" : "text-muted-foreground",
														].join(" ")}
														onClick={() => field.onChange("User")}
													>
														<span className="truncate text-sm font-medium">Regular User</span>
														<input
															className="sr-only"
															type="radio"
															value="User"
															checked={field.value === "User"}
															onChange={() => field.onChange("User")}
														/>
													</label>
													<label
														className={[
															"group flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 transition-all",
															selectedRole === "Vendor" ? "bg-background shadow-sm text-primary" : "text-muted-foreground",
														].join(" ")}
														onClick={() => field.onChange("Vendor")}
													>
														<span className="truncate text-sm font-medium">Vendor</span>
														<input
															className="sr-only"
															type="radio"
															value="Vendor"
															checked={field.value === "Vendor"}
															onChange={() => field.onChange("Vendor")}
														/>
													</label>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="full_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full name</FormLabel>
											<FormControl>
												<div className="relative">
													<Input id="full_name" type="text" autoComplete="name" placeholder="Enter your full name" {...field} />
													<UserRound className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email address</FormLabel>
											<FormControl>
												<div className="relative">
													<Input id="email" type="email" autoComplete="email" placeholder="name@example.com" {...field} />
													<Mail className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Password</FormLabel>
												<FormControl>
													<Input id="password" type="password" autoComplete="new-password" placeholder="Min. 8 characters" {...field} />
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
												<FormLabel>Confirm password</FormLabel>
												<FormControl>
													<Input
														id="confirmPassword"
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
								</div>

								<FormField
									control={form.control}
									name="acceptTerms"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<label className="flex items-start gap-3 rounded-lg border border-border/60 bg-background px-3 py-2">
													<input
														type="checkbox"
														checked={field.value}
														onChange={(event) => field.onChange(event.target.checked)}
														className="mt-1 size-4 rounded border-border text-primary"
													/>
													<span className="text-sm text-muted-foreground">
														By creating an account, you agree to our{" "}
														<Link href="#" className="font-semibold text-primary hover:underline">
															Terms of Service
														</Link>{" "}
														and{" "}
														<Link href="#" className="font-semibold text-primary hover:underline">
															Privacy Policy
														</Link>
														.
													</span>
												</label>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button className="h-12 w-full text-base font-semibold" disabled={form.formState.isSubmitting} type="submit">
									{form.formState.isSubmitting ? "Creating account..." : "Create Account"}
								</Button>
							</form>
						</Form>

						<p className="text-center text-sm text-muted-foreground">
							Already have an account?{" "}
							<Link href="/login" className="font-semibold text-primary hover:underline">
								Log In
							</Link>
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}