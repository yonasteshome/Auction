import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";

type EcommerceErrorStateProps = {
  title?: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EcommerceErrorState({
  title = "Unable to load this page",
  message = "Please try again in a moment.",
  actionHref = "/shop",
  actionLabel = "Go to shop",
}: EcommerceErrorStateProps) {
  return (
    <Alert variant="destructive" className="mx-auto max-w-4xl">
      <AlertTriangle className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{message}</p>
        <Button asChild size="sm" variant="outline">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
