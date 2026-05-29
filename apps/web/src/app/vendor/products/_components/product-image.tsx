"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/images/product-placeholder.svg";

export function ProductImage({ src, alt }: { src: string | null; alt: string }) {
  const [imageSource, setImageSource] = useState(src || FALLBACK_IMAGE);

  return (
    <Image
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      height={56}
      onError={() => setImageSource(FALLBACK_IMAGE)}
      src={imageSource}
      unoptimized
      width={56}
    />
  );
}
