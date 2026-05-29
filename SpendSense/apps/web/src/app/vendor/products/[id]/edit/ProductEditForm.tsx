"use client";

import { updateListingAction } from "@/actions/vendor/listingActions";
import type {
    MarketCategory,
    MarketItem,
    VendorPriceResponse,
} from "@/types/api/vendor";
import {
    ChevronDown,
    ChevronRight,
    Image as ImageIcon,
    Info,
    Upload,
    X,
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type ProductEditFormProps = {
  productId: string;
  initialItems: MarketItem[];
  initialCategories: MarketCategory[];
  initialProduct: VendorPriceResponse;
};

type EditableImage =
  | {
      id: string;
      preview: string;
      source: "existing";
    }
  | {
      id: string;
      preview: string;
      source: "local";
      file: File;
    };

function buildImageUrl(src: string | null | undefined) {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  return `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${src}`;
}

function getInitialImages(product: VendorPriceResponse): EditableImage[] {
  const galleryImages =
    product.images
      ?.slice()
      .sort((a, b) => a.position - b.position)
      .flatMap((image): EditableImage[] => {
        const preview = buildImageUrl(image.url);
        return preview
          ? [{ id: `existing-${image.id}`, preview, source: "existing" }]
          : [];
      }) ?? [];

  if (galleryImages.length > 0) return galleryImages;

  const preview = buildImageUrl(product.image);
  return preview ? [{ id: "existing-cover", preview, source: "existing" }] : [];
}

export default function ProductEditForm({
  productId,
  initialItems,
  initialCategories,
  initialProduct,
}: ProductEditFormProps) {
  const [sourceProduct, setSourceProduct] = useState(initialProduct);
  const initialCategory =
    initialItems.find((item) => item.id === initialProduct.item)?.category ||
    "";
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(initialCategory);
  const [selectedItemId, setSelectedItemId] = useState<number | "">(
    initialProduct.item,
  );
  const [description, setDescription] = useState<string>(
    initialProduct.description || "",
  );
  const [variant, setVariant] = useState<string>(initialProduct.variant || "");
  const [price, setPrice] = useState<string>(
    String(initialProduct.price ?? ""),
  );
  const [basePrice, setBasePrice] = useState<string>(
    String(initialProduct.base_price ?? initialProduct.price ?? ""),
  );
  const [stockCount, setStockCount] = useState<string>(
    String(initialProduct.stock_count ?? 0),
  );
  const [images, setImages] = useState<EditableImage[]>(() =>
    getInitialImages(initialProduct),
  );
  const [saving, setSaving] = useState(false);

  const filteredItems = useMemo(() => {
    if (!selectedCategoryId) return initialItems;
    return initialItems.filter((item) => item.category === selectedCategoryId);
  }, [selectedCategoryId, initialItems]);

  const selectedItem = useMemo(() => {
    return initialItems.find((item) => item.id === selectedItemId) || null;
  }, [selectedItemId, initialItems]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
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
            id: `local-${file.name}-${file.lastModified}-${prev.length}`,
            file,
            preview: reader.result as string,
            source: "local",
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const image = prev[index];
      if (image?.source === "existing") {
        toast.info(
          "Existing images will stay on the listing. Upload new images to replace or add media.",
        );
        return prev;
      }
      return prev.filter((_, idx) => idx !== index);
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      if (!selectedItemId) {
        toast.error("Please select a product from the catalog.");
        setSaving(false);
        return;
      }

      const priceNum = Number(price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        toast.error("Enter a valid price greater than zero.");
        setSaving(false);
        return;
      }

      const basePriceNum = basePrice.trim() ? Number(basePrice) : priceNum;
      if (!Number.isFinite(basePriceNum) || basePriceNum <= 0) {
        toast.error("Enter a valid base price greater than zero.");
        setSaving(false);
        return;
      }

      const stockNum = Number(stockCount);
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        toast.error("Enter a valid stock value of zero or more.");
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("item", String(selectedItemId));
      formData.append("price", String(priceNum));
      formData.append("base_price", String(basePriceNum));
      formData.append("stock_count", String(stockNum));
      formData.append("description", description.trim());
      formData.append("variant", variant.trim());
      const newImages = images.filter(
        (image): image is Extract<EditableImage, { source: "local" }> =>
          image.source === "local",
      );
      if (newImages[0]) {
        formData.append("image", newImages[0].file);
      }
      for (const image of newImages) {
        formData.append("images", image.file);
      }

      const result = await updateListingAction(productId, formData);
      if (result.success) {
        setSourceProduct(result.data);
        setSelectedItemId(result.data.item);
        setDescription(result.data.description || "");
        setVariant(result.data.variant || "");
        setPrice(String(result.data.price));
        setBasePrice(String(result.data.base_price ?? result.data.price));
        setStockCount(String(result.data.stock_count));
        setImages(getInitialImages(result.data));
        toast.success("Product updated successfully", {
          description: `Listing #${result.data.id} — ${result.data.item_name} at ETB ${result.data.price}`,
        });
      } else {
        toast.error("Failed to update listing", {
          description: result.message,
        });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update product.";
      toast.error("Something went wrong", { description: message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id="product-edit-form" onSubmit={onSubmit}>
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link
            className="transition-colors hover:text-[#135bec]"
            href="/vendor/products"
          >
            Products
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-600">Edit Product</span>
        </nav>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {sourceProduct.item_name || "Edit Product"}
            </h2>
            <p className="mt-1 text-slate-500">
              Update pricing and media for this listing.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-[#f0f2f4]"
              href="/vendor/products"
            >
              Cancel
            </Link>
            <button
              className="flex items-center gap-2 rounded-xl bg-[#135bec] px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#135bec]/20 transition-all hover:bg-[#135bec]/90 disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-6 rounded-xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">
              General Information
            </h3>
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
                      setSelectedItemId("");
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

            {selectedItem ? (
              <div className="rounded-lg border border-blue-100/50 bg-blue-50/50 p-4">
                <p className="text-sm font-bold text-slate-800">
                  {selectedItem.name}
                </p>
                <p className="text-[11px] font-medium uppercase tracking-tight text-slate-500">
                  Category: {selectedItem.category} • Unit: {selectedItem.unit}
                </p>
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Description
              </label>
              <textarea
                className="min-h-28 w-full rounded-lg border-none bg-[#f0f2f4] px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-[#135bec]/20"
                placeholder="Describe the product, size options, and any important details."
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
                  Base reference price for 1 unit of the product.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Variant Price (ETB)
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
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Info size={12} className="text-[#135bec]" />
                Enter the selected variant price per {" "}
                {selectedItem?.unit || sourceProduct.unit || "unit"}.
              </p>
            </div>

            <div>
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
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Info size={12} className="text-[#135bec]" />
                Update how many units are available for sale.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
              <ImageIcon size={18} className="text-[#135bec]" />
              Product Media
            </h3>

            <div className="grid gap-2">
              {images[0] ? (
                <img
                  alt="Product cover image"
                  className="aspect-square w-full rounded-md border border-slate-200 object-cover"
                  src={images[0].preview}
                />
              ) : null}

              <div className="grid grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div key={image.id} className="relative aspect-square">
                    <img
                      alt={
                        image.source === "existing"
                          ? "Existing product image"
                          : "New product image"
                      }
                      className="aspect-square w-full rounded-md border border-slate-200 object-cover"
                      src={image.preview}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-2 -top-2 z-10 rounded-full bg-red-500 p-1 text-white shadow-md transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                      disabled={image.source === "existing"}
                      title={
                        image.source === "existing"
                          ? "Existing images stay until replaced by the backend"
                          : "Remove image"
                      }
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                <label className="group flex aspect-square w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 transition-colors duration-100 hover:bg-slate-100">
                  <Upload className="h-5 w-5 text-slate-400 transition-colors group-hover:text-[#135bec]" />
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

              <p className="text-[11px] font-medium text-slate-400">
                JPG, PNG or WEBP. You can upload multiple images, max 5MB each.
              </p>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
