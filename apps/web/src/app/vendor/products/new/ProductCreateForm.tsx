"use client";

import { createListingAction } from "@/actions/vendor/listingActions";
import { MarketCategory, MarketItem } from "@/types/api/vendor";
import {
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Image as ImageIcon,
    Info,
    Upload,
    Verified,
    X
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

interface ProductCreateFormProps {
  initialItems: MarketItem[];
  initialCategories: MarketCategory[];
  vendorId: string | null;
}

type LocalImage = {
  id: string;
  file: File;
  preview: string;
};

export default function ProductCreateForm({
  initialItems,
  initialCategories,
  vendorId,
}: ProductCreateFormProps) {
  // const [vendorId, setVendorId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [description, setDescription] = useState<string>("");
  const [variant, setVariant] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [basePrice, setBasePrice] = useState<string>("");
  const [stockCount, setStockCount] = useState<string>("");
  const [images, setImages] = useState<LocalImage[]>([]);
  const [saving, setSaving] = useState(false);

  // useEffect(() => {
  //   const storedId = localStorage.getItem("MarketSight_vendor_id") || "";
  //   setVendorId(storedId);
  // }, []);

  const filteredItems = useMemo(() => {
    if (!selectedCategoryId) return initialItems;
    return initialItems.filter((item) => item.category === selectedCategoryId);
  }, [selectedCategoryId, initialItems]);

  const selectedItem = useMemo(() => {
    return initialItems.find((item) => item.id === selectedItemId) || null;
  }, [selectedItemId, initialItems]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: image size must be less than 5MB`);
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [
          ...prev,
          {
            id: `${file.name}-${file.lastModified}-${prev.length}`,
            file,
            preview: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const removed = prev[index];
      if (removed?.preview.startsWith("data:") === false) {
        // Since we are using file reader data URLs, revoking isn't strictly necessary for FileReader.
        // But if we ever switch to createObjectURL, this prevents memory leaks.
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, idx) => idx !== index);
    });
  }

  function moveImage(index: number, direction: "left" | "right") {
    setImages((prev) => {
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vendorId) {
      toast.error(
        "Vendor ID is missing. Please make sure you are registered as a vendor.",
      );
      return;
    }

    if (!selectedItemId) {
      toast.error("Please select a product from the catalog.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price greater than zero.");
      return;
    }

    const basePriceNum = basePrice.trim() ? parseFloat(basePrice) : priceNum;
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      toast.error("Please enter a valid base price greater than zero.");
      return;
    }

    const stockNum = Number(stockCount);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      toast.error("Please enter a valid stock value of zero or more.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("item", String(selectedItemId));
    formData.append("price", String(priceNum));
    formData.append("base_price", String(basePriceNum));
    formData.append("stock_count", String(stockNum));
    formData.append("description", description.trim());
    formData.append("variant", variant.trim());
    if (images[0]?.file) {
      formData.append("image", images[0].file);
    }
    for (const image of images) {
      formData.append("images", image.file);
    }

    try {
      const result = await createListingAction(vendorId, formData);
      if (result.success) {
        toast.success("Product Created successfully!", {
          description: `Listing #${result.data.id} — ${result.data.item_name} at ETB ${result.data.price}`,
        });
        setSelectedItemId("");
        setDescription("");
        setVariant("");
        setPrice("");
        setBasePrice("");
        setStockCount("");
        setImages([]);
      } else {
        toast.error("Failed to create listing", {
          description: result.message,
        });
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Failed to create product listing. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link
            className="transition-colors hover:text-[#135bec]"
            href="/vendor/products"
          >
            Products
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-600">New Product</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              New Product
            </h2>
            <p className="mt-1 text-slate-500">
              Provide details to showcase your product on the MarketSight
              marketplace.
            </p>
            {vendorId && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Active Vendor:{" "}
                  <span className="text-[#135bec]">
                    {vendorId.slice(0, 8)}…
                  </span>
                </p>
              </div>
            )}
            {!vendorId && (
              <p className="mt-2 text-xs font-medium text-red-500">
                ⚠ Vendor ID not found. Please register as a vendor first.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/vendor/products"
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-[#f0f2f4] active:scale-95"
            >
              Cancel
            </Link>
            <button
              form="product-form"
              type="submit"
              disabled={saving || !vendorId}
              className="flex items-center gap-2 rounded-xl bg-[#135bec] px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#135bec]/20 transition-all hover:bg-[#135bec]/90 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : (
                "Save Product"
              )}
            </button>
          </div>
        </div>
      </div>

      <form
        id="product-form"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        onSubmit={onSubmit}
      >
        {/* Main Info Card */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-6 rounded-xl bg-white p-8 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              General Information
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Filter By Category
                  </label>
                  <div className="relative">
                    <select
                      className="w-full cursor-pointer appearance-none rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                      value={selectedCategoryId}
                      onChange={(e) => {
                        setSelectedCategoryId(e.target.value);
                        setSelectedItemId(""); // Reset selected item when category changes
                      }}
                    >
                      <option value="">All Categories</option>
                      {initialCategories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Select Product
                  </label>
                  <div className="relative">
                    <select
                      className="w-full cursor-pointer appearance-none rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                      required
                      value={selectedItemId}
                      onChange={(e) =>
                        setSelectedItemId(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                    >
                      <option value="">-- Choose Product --</option>
                      {filteredItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                  </div>
                </div>
              </div>

              {selectedItem && (
                <div className="rounded-lg bg-blue-50/50 p-4 border border-blue-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedItem.image ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 shadow-inner">
                        <img
                          src={
                            selectedItem.image.startsWith("http")
                              ? selectedItem.image
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${selectedItem.image}`
                          }
                          alt={selectedItem.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <ImageIcon size={20} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedItem.name}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                        Category: {selectedItem.category} • Unit:{" "}
                        {selectedItem.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">
                      Catalog Item
                    </p>
                    <p className="text-sm font-mono font-bold text-slate-700">
                      #{selectedItem.id}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
                  Description
                </label>
                <textarea
                  className="min-h-28 w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                  placeholder="Describe the product, size options, and what makes this listing unique."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Variant
                  </label>
                  <input
                    className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                    type="text"
                    placeholder="Optional, e.g. 5 liters, 10 liters, Others"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                  />
                  <p className="mt-2 text-[11px] text-slate-400">
                    Leave blank if this product has no variant.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Base Price (1 unit)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      ETB
                    </span>
                    <input
                      className="w-full rounded-lg border-none bg-[#f0f2f4] py-3 pl-12 pr-4 text-sm font-bold transition-all focus:ring-2 focus:ring-[#135bec]/20"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Price per 1 unit, used as the base reference for variant pricing.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
                  Variant Price (ETB)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ETB
                  </span>
                  <input
                    className="w-full rounded-lg border-none bg-[#f0f2f4] pl-12 pr-4 py-3 text-sm font-bold transition-all focus:ring-2 focus:ring-[#135bec]/20"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Info size={12} className="text-[#135bec]" />
                  Enter the selected variant price per {selectedItem?.unit || "unit"}.
                </p>
              </div>

              <div className="pt-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
                  Stock Quantity
                </label>
                <input
                  className="w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm font-bold transition-all focus:ring-2 focus:ring-[#135bec]/20"
                  type="number"
                  step="1"
                  min="0"
                  required
                  placeholder="0"
                  value={stockCount}
                  onChange={(e) => setStockCount(e.target.value)}
                />
                <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Info size={12} className="text-[#135bec]" />
                  Enter how many units are available for sale.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Info Card */}
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
              Pricing Estimation
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Base Listing Price
                  </span>
                  <span className="font-bold text-slate-700">
                    {price ? `ETB ${parseFloat(price).toFixed(2)}` : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Available Stock
                  </span>
                  <span className="font-bold text-slate-700">
                    {stockCount
                      ? `${stockCount} ${selectedItem?.unit || "units"}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Service Fee (2.5%)
                  </span>
                  <span className="text-red-500 font-bold">
                    -
                    {price
                      ? `ETB ${(parseFloat(price) * 0.025).toFixed(2)}`
                      : "-"}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Your Earning</span>
                  <span className="text-xl font-black text-emerald-600">
                    {price
                      ? `ETB ${(parseFloat(price) * 0.975).toFixed(2)}`
                      : "-"}
                  </span>
                </div>
              </div>
              <div className="bg-[#f0f2f4]/50 rounded-xl p-5 flex flex-col justify-center border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-[#135bec]">
                  <Verified size={18} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    MarketSight Marketplace
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Listings with clear images and competitive pricing are 4x more
                  likely to convert into sales. We recommend setting prices
                  based on current market trends.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
              <span className="text-[#135bec]">
                <ImageIcon size={20} />
              </span>
              Product Media
            </h3>

            <div className="grid gap-2">
              {images[0] && (
                <img
                  alt="Product cover image"
                  className="aspect-square w-full rounded-md object-cover border border-slate-200"
                  src={images[0].preview}
                />
              )}
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, index) => (
                  <div key={img.id} className="relative aspect-square">
                    <img
                      alt="Uploaded image"
                      className="border border-slate-200 aspect-square w-full rounded-md object-cover"
                      src={img.preview}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                <label className="cursor-pointer hover:bg-slate-100 ease-in duration-100 flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 group">
                  <Upload className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <span className="sr-only">Upload Images</span>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-[#135bec] to-blue-700 p-6 text-white shadow-xl shadow-[#135bec]/30 border border-white/10">
            <h4 className="mb-3 flex items-center gap-2 font-bold tracking-tight">
              <CheckCircle2 size={20} className="text-emerald-300" />
              Listing Readiness
            </h4>
            <p className="mb-5 text-[11px] leading-relaxed opacity-80 font-medium">
              Your product will be live immediately after saving. Ensure all
              details are correct.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                {selectedItemId ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-white/20" />
                )}
                PRODUCT SELECTION
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                {price && parseFloat(price) > 0 ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-white/20" />
                )}
                PRICING DETAILS
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                {basePrice.trim() ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-white/20" />
                )}
                BASE PRICE
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                {description.trim() ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-white/20" />
                )}
                DESCRIPTION
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                {stockCount !== "" && Number(stockCount) >= 0 ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-white/20" />
                )}
                STOCK VALUE
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                {images.length > 0 ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-white/20" />
                )}
                MEDIA ASSETS
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-white/50">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-[#135bec] mt-0.5 shrink-0" />
              <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                Need help? Contact our vendor support team or visit our{" "}
                <Link href="/help" className="text-[#135bec] underline">
                  Help Center
                </Link>{" "}
                for listing guidelines.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

