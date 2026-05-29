"use client";

import { Camera, UploadCloud, X } from "lucide-react";
import { useCallback, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png";

interface PhotoUploaderProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

export function PhotoUploader({ file, onChange }: PhotoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (selected: File | null) => {
      setError(null);
      if (!selected) {
        onChange(null);
        setPreviewUrl(null);
        return;
      }
      if (!ACCEPT.split(",").some((t) => selected.type === t.trim())) {
        setError("Only JPEG or PNG images are allowed.");
        return;
      }
      if (selected.size > MAX_BYTES) {
        setError("Image must be 5MB or smaller.");
        return;
      }
      onChange(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    },
    [onChange],
  );

  const remove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    handleFile(null);
  };

  return (
    <div>
      <label
        htmlFor="price-photo"
        className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          previewUrl || file
            ? "border-[#135bec]/30 bg-[#f0f2f4]/30"
            : "border-[#cbd5e1]/60 bg-[#f8f9fa] hover:bg-[#f0f2f4]"
        }`}
      >
        {previewUrl ? (
          <div className="relative flex h-full w-full items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Price evidence preview"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={remove}
              className="absolute right-3 top-3 rounded-full bg-red-500/90 p-1.5 text-white shadow-md hover:bg-red-600"
              aria-label="Remove photo"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e2e6ff]">
              <UploadCloud className="size-6 text-[#135bec]" />
            </div>
            <p className="text-sm font-bold text-[#111318]">
              Drag & drop or click to upload
            </p>
            <p className="text-xs text-[#616f89]">JPEG or PNG, max 5MB</p>
          </div>
        )}
        <input
          id="price-photo"
          type="file"
          className="hidden"
          accept={ACCEPT}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 flex items-center gap-1 text-xs text-[#616f89]">
        <Camera className="size-3.5" />
        Optional — price tag or receipt helps moderation
      </p>
    </div>
  );
}
