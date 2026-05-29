"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  LayoutGrid, 
  Calendar, 
  Store, 
  FileText, 
  Upload, 
  Lightbulb,
  CheckCircle2,
  Loader2,
  AlertCircle,
  CreditCard,
  ShoppingCart
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { createExpenseAction } from "@/actions/finance";
import { getVendors, getStaticMeta } from "@/actions/ecommerce";
import { Vendor, Product, Category } from "@/lib/ecommerce-types";
import { toast } from "sonner";
import Link from "next/link";
import { Search } from "lucide-react";

export default function ExpenseNewPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [category, setCategory] = useState("Cereals & Grains");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [vendorId, setVendorId] = useState<string | undefined>(undefined);
  const [itemId, setItemId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const [availableVendors, setAvailableVendors] = useState<Vendor[]>([]);
  const [availableItems, setAvailableItems] = useState<Product[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const [vendorsData, meta] = await Promise.all([getVendors(), getStaticMeta()]);
        setAvailableVendors(vendorsData);
        setAvailableItems(meta.products || []);
        setAvailableCategories(meta.categories || []);
        // console.log(meta.products);
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      } finally {
        setIsLoadingMetadata(false);
      }
    }
    fetchMetadata();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    
    startTransition(async () => {
      const result = await createExpenseAction({
        category,
        amount: amount || "0",
        date,
        description: description || undefined,
        note: note || undefined,
        payment_method: paymentMethod,
        vendor: vendorId,
        item: itemId,
      });

      if (result.success) {
        toast.success("Transaction recorded successfully");
        router.push("/expenses");
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    });
  };

  return (
    <main className="pb-12 px-4 md:px-12 min-h-screen bg-slate-50/50">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <Link
            href="/expenses"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-4 hover:underline"
          >
            <ArrowLeft className="text-sm" />
            Back to Finance
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Record New Expense
          </h2>
          <p className="text-slate-500 mt-1">
            Add details of your expenditure to keep your budget accurate.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="size-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Amount Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Transaction Amount
              </label>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-extrabold text-primary">ETB</span>
                <input
                  className="text-5xl font-extrabold bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-slate-100"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <LayoutGrid className="size-4" />
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full bg-slate-50 border-none rounded-xl h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 sticky top-0 bg-white border-b z-10">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                          <Input
                            placeholder="Search categories..."
                            value={categoryQuery}
                            onChange={(e) => setCategoryQuery(e.target.value)}
                            className="w-full h-8 pl-7 text-xs bg-slate-50 border-none"
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto mt-2">
                        {availableCategories
                          .filter((c) => c.name.toLowerCase().includes(categoryQuery.toLowerCase()))
                          .map((c) => (
                            <SelectItem key={c.name} value={c.name}>
                              <div className="flex items-center gap-3 py-1">
                                <div className="size-8 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 shadow-sm">
                                  <img 
                                    src={c.image_url} 
                                    className="w-full h-full object-cover" 
                                    alt="" 
                                    onError={(e) => (e.currentTarget.src = "https://api.spendsense.app/static/categories/default.jpg")}
                                  />
                                </div>
                                <span className="font-medium text-slate-700">{c.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        {availableCategories.filter((c) => c.name.toLowerCase().includes(categoryQuery.toLowerCase())).length === 0 && (
                          <div className="p-4 text-center text-xs text-slate-500">
                            No categories found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                </Select>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <CreditCard className="size-4" />
                  Payment Method
                </label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full bg-slate-50 border-none rounded-xl h-12">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Telebirr">Telebirr</SelectItem>
                    <SelectItem value="Chapa">Chapa / Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Calendar className="size-4" />
                  Transaction Date
                </label>
                <Input
                  type="date"
                  className="w-full bg-slate-50 border-none rounded-xl h-12"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <ShoppingCart className="size-4" />
                  Market Item (Optional)
                </label>
                <Select
                  value={itemId?.toString() || "none"}
                  onValueChange={(val) => setItemId(val === "none" ? undefined : parseInt(val))}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-none rounded-xl h-12">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 sticky top-0 bg-white border-b z-10">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                        <Input
                          placeholder="Search items..."
                          value={itemQuery}
                          onChange={(e) => setItemQuery(e.target.value)}
                          className="w-full h-8 pl-7 text-xs bg-slate-50 border-none"
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto mt-2">
                      <SelectItem value="none">None</SelectItem>
                      {availableItems
                        .filter((it) => it.item_name.toLowerCase().includes(itemQuery.toLowerCase()))
                        .map((item) => (
                          <SelectItem key={item.item_id} value={item.item_id.toString()}>
                            <div className="flex items-center gap-3 py-1">
                                <div className="size-8 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 shadow-sm">
                                  <img 
                                    src={item.image_url} 
                                    className="w-full h-full object-cover" 
                                    alt="" 
                                    onError={(e) => (e.currentTarget.src = "https://api.spendsense.app/static/products/default.jpg")}
                                  />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-700">{item.item_name}</span>
                                    <span className="text-[10px] text-slate-400 capitalize">{item.category} • {item.unit}</span>
                                </div>
                              </div>
                          </SelectItem>
                        ))}
                      {availableItems.filter((it) => it.item_name.toLowerCase().includes(itemQuery.toLowerCase())).length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No items found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Merchant / Vendor */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Store className="size-4" />
                Linked Vendor (Optional)
              </label>
              <Select 
                value={vendorId || "none"} 
                onValueChange={(val) => setVendorId(val === "none" ? undefined : val)}
              >
                <SelectTrigger className="w-full bg-slate-50 border-none rounded-xl h-12">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Manual Entry / None</SelectItem>
                  {availableVendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.shop_name} ({v.city || "Unknown"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Manual Description / Vendor Name
                </label>
                <Input
                  placeholder="Enter vendor name manually if not in list..."
                  className="w-full bg-slate-50 border-none rounded-xl h-12"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <FileText className="size-4" />
                Additional Notes
              </label>
              <Textarea
                className="w-full bg-slate-50 border-none rounded-xl p-4 min-h-[100px]"
                placeholder="Purpose of transaction, project codes, or internal references..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column: Contextual Actions & Upload */}
          <div className="lg:col-span-4 space-y-6">
            {/* Receipt Upload Area */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center py-12 transition-all hover:border-primary/50 group cursor-pointer">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Upload className="size-8" />
              </div>
              <h4 className="font-bold text-slate-900">Upload Receipt</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-[200px]">
                Drag and drop your receipt image or PDF here (Max 10MB)
              </p>
              <Button variant="secondary" size="sm" className="mt-6 rounded-full">
                Browse Files
              </Button>
            </div>

            {/* Smart Tip Card */}
            <div className="bg-primary rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="size-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Smart Tip</span>
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                Recording expenses within 24 hours improves reporting accuracy
                by up to 40%. Our AI can now auto-categorize merchants from
                Addis Ababa.
              </p>
            </div>

            {/* Final Actions */}
            <div className="space-y-3 pt-4">
              <Button
                size="lg"
                className="w-full py-8 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="size-5" />
                    Confirm Transaction
                  </>
                )}
              </Button>
              
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

