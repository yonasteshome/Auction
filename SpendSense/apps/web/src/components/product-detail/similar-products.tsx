import Link from "next/link";
import { type SimilarProductResponse } from "@/types/api/product-details";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface SimilarProductsProps {
  products: SimilarProductResponse[];
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-3xl border border-[#e5e7eb] dark:border-[#2a3140] p-6 lg:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#111318] dark:text-white">Similar & Substitute Products</h3>
          <p className="text-sm text-[#616f89] mt-1">Explore alternatives in the same category</p>
        </div>
        <Button variant="ghost" className="text-[#135bec] text-sm font-bold hidden sm:flex items-center gap-1">
          View all in {products[0]?.category} <ArrowRight size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="group block">
            <div className="border border-[#e5e7eb] dark:border-[#2a3140] rounded-2xl p-4 transition-all hover:border-[#135bec]/50 hover:shadow-md bg-slate-50/50 dark:bg-slate-900/50 h-full flex flex-col">
              {product.image ? (
                <div className="aspect-video w-full rounded-xl bg-slate-200 dark:bg-slate-800 mb-4 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-xl bg-slate-200 dark:bg-slate-800 mb-4 flex items-center justify-center text-slate-400 text-xs">
                  No Image
                </div>
              )}
              
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#616f89] uppercase tracking-wider mb-1">{product.category}</p>
                <h4 className="font-bold text-[#111318] dark:text-white group-hover:text-[#135bec] transition-colors line-clamp-2">{product.name}</h4>
                
                <div className="mt-3">
                  <span className="text-xs text-muted-foreground">per {product.unit}</span>
                </div>

                {product.description && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
