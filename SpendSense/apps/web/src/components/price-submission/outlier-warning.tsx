"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import type { OutlierCheckResult } from "@/hooks/use-outlier-check";

interface OutlierWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outlier: OutlierCheckResult | null;
  serverWarning?: string | null;
  onConfirm: () => void;
}

export function OutlierWarning({
  open,
  onOpenChange,
  outlier,
  serverWarning,
  onConfirm,
}: OutlierWarningProps) {
  const message = serverWarning ?? outlier?.message;
  if (!message) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unusual price detected</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Adjust price</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm & submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
