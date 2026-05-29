"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { priceAlertInputSchema, PriceAlertInput } from "@/lib/validation/price-alerts";
import { createPriceAlert, updatePriceAlert, deletePriceAlert, getUserPriceAlerts } from "@/actions/price-alerts";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Bell, Trash2, LogIn, Loader2, Mail, MessageSquare, BellRing } from "lucide-react";
import Link from "next/link";

interface PriceAlertModalProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
  currentPrice?: number;
  city?: string;
  isAuthenticated?: boolean;
}

const ALERT_METHODS = [
  { value: "in-app", label: "In-App", icon: BellRing },
  // { value: "email", label: "Email", icon: Mail },
  // { value: "sms", label: "SMS", icon: MessageSquare },
] as const;

const EXPIRY_OPTIONS = [
  { value: "7", label: "1 Week" },
  { value: "30", label: "1 Month" },
  { value: "90", label: "3 Months" },
] as const;

export function PriceAlertModal({
  itemId,
  isOpen,
  onClose,
  currentPrice,
  city,
  isAuthenticated = true,
}: PriceAlertModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [existingAlertId, setExistingAlertId] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const defaultTargetPrice = currentPrice ? Math.round(currentPrice * 0.9) : undefined;

  const form = useForm<PriceAlertInput>({
    resolver: zodResolver(priceAlertInputSchema) as any,
    defaultValues: {
      itemId,
      targetPrice: defaultTargetPrice as unknown as number,
      city: city && city !== "All Regions" ? city : undefined,
      alertMethods: ["in-app"],
      expiryDays: "30",
    },
  });

  // Fetch existing alert on open
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    setLoadingExisting(true);
    getUserPriceAlerts(itemId).then((result) => {
      if (result.success && result.data.length > 0) {
        const alert = result.data[0];
        setExistingAlertId(String(alert.id));
        form.reset({
          itemId,
          targetPrice: parseFloat(alert.target_price),
          city: alert.city || (city && city !== "All Regions" ? city : undefined),
          alertMethods: (alert.alert_methods as ("in-app" | "email" | "sms")[]) ?? ["in-app"],
          expiryDays: alert.expiry_days ? String(alert.expiry_days) as "7" | "30" | "90" : "30",
        });
      } else {
        setExistingAlertId(null);
        form.reset({
          itemId,
          targetPrice: defaultTargetPrice as unknown as number,
          city: city && city !== "All Regions" ? city : undefined,
          alertMethods: ["in-app"],
          expiryDays: "30",
        });
      }
    }).finally(() => setLoadingExisting(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemId]);

  const onSubmit = (data: PriceAlertInput) => {
    startTransition(async () => {
      let result;
      if (existingAlertId) {
        result = await updatePriceAlert(existingAlertId, data.targetPrice, data.alertMethods, data.expiryDays);
      } else {
        result = await createPriceAlert(data.itemId, data.targetPrice, data.city, data.alertMethods, data.expiryDays);
      }

      if (result.success) {
        toast.success(
          existingAlertId
            ? `Alert updated! We'll notify you when price drops below ${data.targetPrice} ETB.`
            : `Alert set! We'll notify you when price drops below ${data.targetPrice} ETB.`
        );
        onClose();
      } else {
        toast.error(result.message || "Failed to set alert");
      }
    });
  };

  const handleDelete = () => {
    if (!existingAlertId) return;
    startDeleteTransition(async () => {
      const result = await deletePriceAlert(existingAlertId);
      if (result.success) {
        toast.success("Price alert removed.");
        setExistingAlertId(null);
        form.reset({
          itemId,
          targetPrice: defaultTargetPrice as unknown as number,
          city: city && city !== "All Regions" ? city : undefined,
          alertMethods: ["in-app"],
          expiryDays: "30",
        });
        onClose();
      } else {
        toast.error(result.message || "Failed to remove alert");
      }
    });
  };

  const setPreset = (percent: number) => {
    if (!currentPrice) return;
    form.setValue("targetPrice", Math.round(currentPrice * percent), { shouldValidate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl">{existingAlertId ? "Update Price Alert" : "Set Price Alert"}</DialogTitle>
          </div>
          <DialogDescription>
            {existingAlertId
              ? "Update your existing price alert for this item."
              : "Get notified when the price drops to your target."}
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="py-8 flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-muted rounded-full">
              <LogIn className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Sign in to set price alerts</p>
              <p className="text-sm text-muted-foreground mt-1">
                Track prices and get notified when they drop.
              </p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        ) : loadingExisting ? (
          <div className="py-10 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading alert settings...</span>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            {/* Target Price */}
            <div className="space-y-2">
              <Label htmlFor="targetPrice" className="font-semibold">Target Price (ETB)</Label>
              {currentPrice && (
                <p className="text-xs text-muted-foreground">
                  Current price: <span className="font-medium text-foreground">{currentPrice.toLocaleString()} ETB</span>
                </p>
              )}
              <Input
                id="targetPrice"
                type="number"
                step="0.01"
                placeholder="e.g. 450"
                {...form.register("targetPrice", { valueAsNumber: true })}
                className="text-base"
              />
              {form.formState.errors.targetPrice && (
                <p className="text-sm text-red-500">{form.formState.errors.targetPrice.message}</p>
              )}

              {currentPrice && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <p className="text-xs text-muted-foreground w-full">Quick presets:</p>
                  {[
                    { label: "5% off", pct: 0.95 },
                    { label: "10% off", pct: 0.90 },
                    { label: "15% off", pct: 0.85 },
                    { label: "20% off", pct: 0.80 },
                  ].map(({ label, pct }) => (
                    <Button
                      key={label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreset(pct)}
                      className="text-xs h-7 px-2.5"
                    >
                      {label} ({Math.round(currentPrice * pct)} ETB)
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Alert Methods */}
            <div className="space-y-3">
              <Label className="font-semibold">Notify me via</Label>
              <Controller
                control={form.control}
                name="alertMethods"
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {ALERT_METHODS.map(({ value, label, icon: Icon }) => {
                      const isSelected = field.value?.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            const current = field.value ?? [];
                            if (isSelected) {
                              field.onChange(current.filter((v) => v !== value));
                            } else {
                              field.onChange([...current, value]);
                            }
                          }}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                              : "border-border bg-card text-muted-foreground hover:border-blue-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {form.formState.errors.alertMethods && (
                <p className="text-sm text-red-500">{form.formState.errors.alertMethods.message}</p>
              )}
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label htmlFor="expiryDays" className="font-semibold">Alert Expires After</Label>
              <Controller
                control={form.control}
                name="expiryDays"
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {EXPIRY_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                          field.value === value
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                            : "border-border bg-card text-muted-foreground hover:border-blue-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              {existingAlertId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 gap-1.5"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Remove Alert
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  disabled={isPending}
                >
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{existingAlertId ? "Updating..." : "Setting..."}</>
                  ) : (
                    <><Bell className="w-4 h-4" />{existingAlertId ? "Update Alert" : "Set Alert"}</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
