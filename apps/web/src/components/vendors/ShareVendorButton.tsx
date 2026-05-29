"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";

interface ShareVendorButtonProps {
  vendorId: string;
  shopName: string;
}

export default function ShareVendorButton({
  vendorId,
  shopName,
}: ShareVendorButtonProps) {
  const handleShare = async () => {
    // Construct the sharing URL with UTM parameters
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/vendors/${vendorId}?utm_source=share&utm_medium=social&utm_campaign=vendor`
      : "";

    const shareData = {
      title: `${shopName} on MarketSight Ethiopia`,
      text: `Check out ${shopName} on MarketSight Ethiopia for cost-efficient shopping and verified prices!`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="icon"
      className="p-2 border rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0 cursor-pointer"
      aria-label="Share vendor profile"
    >
      <Share2 className="w-5 h-5" />
    </Button>
  );
}

