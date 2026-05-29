"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  fallbackName: string;
}

export function ProductImageGallery({ images, fallbackName }: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  const hasImages = images && images.length > 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="flex-1 w-full relative flex items-center justify-center p-8">
        {hasImages ? (
          <Image
            src={images[activeImage]}
            alt={fallbackName}
            fill
            className="object-contain p-8 transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-400">
            <Package className="w-24 h-24 mb-4 opacity-50" />
            <span className="text-lg font-medium opacity-50">No image available</span>
          </div>
        )}
      </div>

      {hasImages && images.length > 1 && (
        <div className="flex gap-2 p-4 border-t overflow-x-auto custom-scrollbar">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={cn(
                "relative w-20 h-20 rounded-md border-2 overflow-hidden shrink-0 bg-white",
                activeImage === index ? "border-primary" : "border-transparent hover:border-slate-300"
              )}
            >
              <Image src={src} alt="Thumbnail" fill className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
