import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy | SpendSense Ethiopia",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
      <p className="text-slate-600">
        We collect account details you provide (name, contact, household context) and usage data
        needed to run budgets, price trends, and purchases. Crowdsourced prices are attributed
        internally for moderation; public views focus on item, location, and time — not on
        individual contributors.
      </p>
      <p className="text-slate-600">
        Payment information is processed by your selected provider; we store purchase records
        required for order history and compliance. You may update profile and notification
        preferences in the app.
      </p>
    </article>
  );
}
