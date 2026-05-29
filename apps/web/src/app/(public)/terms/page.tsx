import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of service | SpendSense Ethiopia",
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold tracking-tight">Terms of service</h1>
      <p className="text-slate-600">
        By using SpendSense you agree to provide accurate information to the best of your ability,
        respect community guidelines when submitting prices, and comply with vendor and payment
        terms when completing purchases.
      </p>
      <p className="text-slate-600">
        We may update features and policies; continued use after changes constitutes acceptance.
        Admin and vendor tools have additional obligations described in your onboarding flow.
      </p>
    </article>
  );
}
