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
import { Textarea } from "@repo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { AlertCircle, Camera, Loader2 } from "lucide-react";
import { reportVendor } from "@/actions/vendor-reports";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReportVendorDialogProps {
  vendorId: string;
  shopName: string;
  isAuthenticated: boolean;
}

export default function ReportVendorDialog({
  vendorId,
  shopName,
  isAuthenticated,
}: ReportVendorDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isAuthenticated) {
      toast.error("Please log in to report a vendor", {
        action: {
          label: "Login",
          onClick: () => router.push(`/login?redirect=/vendors/${vendorId}`),
        },
      });
      return;
    }
    setOpen(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    startTransition(async () => {
      const res = await reportVendor({
        vendorId,
        reason: reason as any,
        details: details || undefined,
        evidenceUrls: [], // Images upload mocked
      });

      if (res.success) {
        toast.success("Report submitted. We'll review within 24 hours.");
        setOpen(false);
        setReason("");
        setDetails("");
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="text-xs text-muted-foreground hover:text-red-500 font-medium underline transition-colors focus:outline-none cursor-pointer mt-4 block mx-auto sm:mx-0">
          Report this vendor
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Report {shopName}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Help us keep the marketplace safe. Your report is completely anonymous.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Reason Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Reason for Report <span className="text-red-500">*</span>
            </label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Misleading prices">Misleading prices</SelectItem>
                <SelectItem value="Fake products">Fake products</SelectItem>
                <SelectItem value="Harassment or abuse">Harassment or abuse</SelectItem>
                <SelectItem value="Spam">Spam</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Details Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex justify-between">
              <span>Additional Details</span>
              <span className="text-muted-foreground font-normal">
                {details.length}/500
              </span>
            </label>
            <Textarea
              placeholder="Please provide specific details to help us investigate (optional)..."
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 500))}
              className="rounded-xl min-h-[100px] text-sm resize-none"
              maxLength={500}
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Evidence (Optional)
            </label>
            <div className="flex items-center justify-center border border-dashed rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex flex-col items-center gap-1">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Upload up to 3 screenshots
                </span>
              </div>
            </div>
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
              disabled={!reason || isPending}
              className="rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
