"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Bell, Loader2 } from "lucide-react";
import { createPriceAlert } from "@/actions/price-alerts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PriceAlertDialogProps {
  itemId: string;
  itemName: string;
  price: number;
  shopName: string;
  isAuthenticated: boolean;
  city?: string;
  hasExistingAlert?: boolean;
  existingTargetPrice?: number;
}

export default function PriceAlertDialog({
  itemId,
  itemName,
  price,
  shopName,
  isAuthenticated,
  city,
  hasExistingAlert = false,
  existingTargetPrice,
}: PriceAlertDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState<string>(
    existingTargetPrice ? String(existingTargetPrice) : (price * 0.9).toFixed(0)
  );
  const [methods, setMethods] = useState<string[]>(["in-app"]);
  const [expiry, setExpiry] = useState<string>("1M");
  const [isPending, startTransition] = useTransition();
  const [isActiveAlert, setIsActiveAlert] = useState(hasExistingAlert);
  const router = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isAuthenticated) {
      toast.error("Please log in to set a price alert", {
        action: {
          label: "Login",
          onClick: () => router.push(`/login?redirect=/vendors/${itemId}`),
        },
      });
      return;
    }
    setOpen(newOpen);
  };

  const handleMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setMethods((prev) => [...prev, method]);
    } else {
      setMethods((prev) => prev.filter((m) => m !== method));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetPrice);

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      toast.error("Target price must be a positive number");
      return;
    }

    if (parsedTarget >= price) {
      toast.error(`Target price must be lower than the current price (ETB ${price})`);
      return;
    }

    if (methods.length === 0) {
      toast.error("Please select at least one alert method");
      return;
    }

    startTransition(async () => {
      const res = await createPriceAlert(itemId, parsedTarget, city, methods, expiry);

      if (res.success) {
        toast.success(
          `Alert set! We'll notify you when ${itemName} drops below ETB ${parsedTarget}`
        );
        setIsActiveAlert(true);
        setOpen(false);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`size-9 rounded-lg border transition-all cursor-pointer p-0 shrink-0 ${
            isActiveAlert
              ? "bg-amber-50 dark:bg-amber-950/20 text-amber-500 border-amber-300 dark:border-amber-900"
              : "hover:bg-muted text-muted-foreground"
          }`}
          aria-label={isActiveAlert ? "Edit price alert" : "Set price alert"}
        >
          <Bell className={`w-4 h-4 ${isActiveAlert ? "fill-current" : ""}`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            {isActiveAlert ? "Edit Price Alert" : "Set Price Alert"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Get notified when {itemName} drops below your target price.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="bg-muted/40 border p-3 rounded-xl text-sm">
            <span className="text-muted-foreground">Current price:</span>{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              ETB {price.toFixed(2)}
            </span>{" "}
            <span className="text-muted-foreground">at {shopName}</span>
          </div>

          {/* Target Price input */}
          <div className="space-y-1.5">
            <Label htmlFor="targetPrice" className="text-xs font-semibold">
              Target Price (ETB) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="targetPrice"
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="rounded-xl pr-12 font-medium"
                placeholder="0"
                min="1"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                ETB
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              We recommend setting this at least 10% below the current price.
            </p>
          </div>

          {/* Alert Methods */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Alert Channels</Label>
            <div className="grid grid-cols-3 gap-2">
              {["in-app", "email", "sms"].map((method) => {
                const isChecked = methods.includes(method);
                return (
                  <div
                    key={method}
                    className={`flex items-center gap-2 border p-2.5 rounded-xl cursor-pointer hover:bg-muted/20 transition-all ${
                      isChecked
                        ? "border-blue-500/50 bg-blue-500/[0.03]"
                        : "border-border"
                    }`}
                    onClick={() => handleMethodChange(method, !isChecked)}
                  >
                    <Checkbox
                      checked={isChecked}
                      className="rounded"
                      id={`method-${method}`}
                    />
                    <span className="text-xs font-semibold capitalize text-foreground">
                      {method}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expiry Select */}
          <div className="space-y-1.5">
            <Label htmlFor="expiry" className="text-xs font-semibold">
              Alert Expiry
            </Label>
            <Select onValueChange={setExpiry} value={expiry}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isActiveAlert ? "Update Alert" : "Set Alert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
