"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export interface BusinessHourEntry {
  day: string;
  start: string;
  end: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface BusinessHoursEditorProps {
  value: BusinessHourEntry[];
  onChange: (hours: BusinessHourEntry[]) => void;
}

export function BusinessHoursEditor({ value, onChange }: BusinessHoursEditorProps) {
  const addRow = () => {
    const usedDays = value.map((e) => e.day);
    const nextDay = DAYS.find((d) => !usedDays.includes(d)) ?? DAYS[0];
    onChange([...value, { day: nextDay, start: "08:00", end: "18:00" }]);
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof BusinessHourEntry, val: string) => {
    onChange(value.map((row, i) => (i === index ? { ...row, [field]: val } : row)));
  };

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground italic py-2">
          No business hours set. Add your opening hours below.
        </p>
      )}

      {value.map((entry, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[160px_1fr_auto_1fr_auto] gap-2 items-center"
        >
          {/* Day Select */}
          <select
            value={entry.day}
            onChange={(e) => updateRow(index, "day", e.target.value)}
            className="w-full rounded-lg border-none bg-[#f0f2f4] dark:bg-[#1e2330] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#135bec]/20 col-span-1"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Start time */}
          <input
            type="time"
            value={entry.start}
            onChange={(e) => updateRow(index, "start", e.target.value)}
            className="rounded-lg border-none bg-[#f0f2f4] dark:bg-[#1e2330] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#135bec]/20 w-full"
          />

          <span className="text-muted-foreground text-sm font-medium text-center">–</span>

          {/* End time */}
          <input
            type="time"
            value={entry.end}
            onChange={(e) => updateRow(index, "end", e.target.value)}
            className="rounded-lg border-none bg-[#f0f2f4] dark:bg-[#1e2330] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#135bec]/20 w-full"
          />

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {value.length < 7 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="gap-1.5 text-xs mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Day
        </Button>
      )}
    </div>
  );
}
