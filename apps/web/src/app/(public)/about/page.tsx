import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About | MarketSight Ethiopia",
  description: "Cost of living intelligence, budgets, and smart shopping for households in Ethiopia.",
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold tracking-tight">About MarketSight</h1>
      <p className="text-lg text-slate-600">
        MarketSight helps Ethiopian households track prices, plan monthly budgets, and shop smarter
        with vendor comparisons grounded in real market data and community price reports.
      </p>
      <h2 className="mt-8 text-xl font-semibold">What we do</h2>
      <ul className="list-disc space-y-2 pl-5 text-slate-600">
        <li>Crowdsourced and moderated price data for key goods</li>
        <li>Personal budget planning and spending visibility</li>
        <li>Ranked vendor options when you are ready to buy</li>
      </ul>
    </article>
  );
}

