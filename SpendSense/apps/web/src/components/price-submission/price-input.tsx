"use client";

import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

function formatDisplay(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const parts = cleaned.split(".");
  const intPart = parts[0] ?? "";
  const dec = parts[1];
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec !== undefined ? `${formatted}.${dec.slice(0, 2)}` : formatted;
}

export function PriceInput({ value, onChange, onBlur, error }: PriceInputProps) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
        Price (ETB) <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-bold text-[#135bec]">
          ETB
        </span>
        <Input
          inputMode="decimal"
          placeholder="0.00"
          className="border-none bg-[#f0f2f4] pl-14 font-bold focus-visible:ring-[#135bec]/20"
          value={formatDisplay(value)}
          onChange={(e) => onChange(e.target.value.replace(/,/g, ""))}
          onBlur={onBlur}
          aria-invalid={!!error}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
