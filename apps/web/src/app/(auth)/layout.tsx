import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,var(--color-muted),transparent_60%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-6xl items-center justify-center">
        {children}
      </div>
    </main>
  );
}
