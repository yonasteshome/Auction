"use client";

import { getVerificationStatus } from "@/actions/vendor/getVerificationStatus";
import { useAuth } from "@/providers/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface VendorStatus {
  is_verified: boolean;
  verification_status: 'unrequested' | 'requested' | 'pending' | 'verified' | 'rejected' | 'suspended';
}

export function VerificationGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Only guard /vendor routes, excluding /vendor/verify and /vendor/profile
    if (pathname.startsWith("/vendor") && pathname !== "/vendor/verify" && pathname !== "/vendor/profile") {
      const checkStatus = async () => {
        try {
          const data = await getVerificationStatus();
          if (data && !data.is_verified) {
            router.push("/vendor/verify");
          } else {
            setIsChecking(false);
          }
        } catch (err) {
          console.error("Verification check failed:", err);
          setIsChecking(false);
        }
      };
      checkStatus();
    } else {
      setIsChecking(false);
    }
  }, [status, pathname, router]);

  if (isChecking && pathname.startsWith("/vendor") && pathname !== "/vendor/verify" && pathname !== "/vendor/profile") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f6f6f8]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#135bec] border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
