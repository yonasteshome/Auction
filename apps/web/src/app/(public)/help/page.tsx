import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Help & support | MarketSight",
};

export default function HelpPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold tracking-tight">Help &amp; support</h1>
      <p className="text-slate-600">
        <strong>Submit a price</strong> from the app after you sign in — pick an item, location, and
        observed price. Submissions are reviewed before they affect public averages.
      </p>
      <p className="text-slate-600">
        <strong>Read trends</strong> on the{" "}
        <Link href="/login" className="text-[#135bec] underline">
          Live Prices
        </Link>{" "}
        page (sign in required) to compare city and national movement over time.
      </p>
      <p className="text-slate-600">
        For account issues, use the email associated with your profile; password reset is available
        from the sign-in screen.
      </p>
    </article>
  );
}

