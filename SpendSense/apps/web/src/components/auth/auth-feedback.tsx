import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";

type AuthFeedbackProps = {
  title: string;
  message: string;
  variant?: "default" | "destructive";
};

export function AuthFeedback({ title, message, variant = "default" }: AuthFeedbackProps) {
  return (
    <Alert variant={variant}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
