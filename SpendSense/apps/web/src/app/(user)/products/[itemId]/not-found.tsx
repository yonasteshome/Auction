import Link from "next/link";
import { PackageX, Home, Search } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
        <PackageX className="w-12 h-12 text-slate-400 dark:text-slate-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Product Not Found</h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
        We couldn't find the product you're looking for. It may have been removed or the link might be broken.
      </p>
      <div className="flex items-center gap-4">
        <Button asChild className="bg-[#135bec] hover:bg-[#0d4fd4] text-white gap-2">
          <Link href="/products">
            <Search className="w-4 h-4" /> Browse Products
          </Link>
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
