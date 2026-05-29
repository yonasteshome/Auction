import { AuthProvider } from "@/providers/auth-provider";
import { RealtimeProvider } from "@/providers/realtime-provider";
import { Toaster } from "@repo/ui/components/sonner";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import "@repo/ui/styles/globals.css";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <TooltipProvider>
          <AuthProvider>
            <RealtimeProvider>
              <NuqsAdapter defaultOptions={{shallow: false}}>{children}</NuqsAdapter>
            </RealtimeProvider>
          </AuthProvider>
        </TooltipProvider>
        <Toaster richColors theme="light" position="top-right" />
      </body>
    </html>
  );
}
