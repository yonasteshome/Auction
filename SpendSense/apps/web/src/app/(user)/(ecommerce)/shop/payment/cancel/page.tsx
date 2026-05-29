import Link from "next/link";
import { Button } from "@repo/ui/components/button";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <h1 className="text-2xl font-bold">Payment cancelled</h1>
      <p className="text-slate-600">No charge was completed. You can return to checkout when you are ready.</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild variant="default">
          <Link href="/checkout">Back to checkout</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
