"use client";

import { createPriceSubmission, updatePriceSubmission } from "@/actions/price-submissions";
import { useOutlierCheck } from "@/hooks/use-outlier-check";
import { DRAFT_STORAGE_KEY, gradesForItem } from "@/lib/constants/markets";
import { itemAveragesSchema } from "@/lib/validation/price-submissions";
import type {
    ContributorStatsResponse, ItemAveragesResponse,
    MySubmissionResponse
} from "@/types/api/price-submissions";
import type { MarketItem } from "@/types/api/vendor";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import {
    Camera,
    CheckCircle2,
    Edit3,
    Lightbulb,
    Loader2,
    MapPin,
    Mic,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useTransition,
} from "react";
import { toast } from "sonner";
import { ContributorStats } from "./contributor-stats";
import { ItemSelector } from "./item-selector";
import { LocationPicker } from "./location-picker";
import { OutlierWarning } from "./outlier-warning";
import { PhotoUploader } from "./photo-uploader";
import { PriceContextPanel } from "./price-context-panel";
import { PriceInput } from "./price-input";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

type FormDraft = {
  itemId: number | "";
  unit: string;
  price: string;
  city: string;
  marketLocation: string;
  vendorName: string;
  dateObserved: string;
  timeObserved: string;
  qualityGrade: string;
  quantityAvailable: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
};

interface SubmissionFormProps {
  items: MarketItem[];
  stats: ContributorStatsResponse | null;
  recentSubmissions?: MySubmissionResponse[];
  editing?: MySubmissionResponse | null;
  onEditComplete?: () => void;
  onSuccess?: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function maxPastIso() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

export function SubmissionForm({
  items,
  stats,
  recentSubmissions = [],
  editing,
  onEditComplete,
  onSuccess,
}: SubmissionFormProps) {
  const [itemId, setItemId] = useState<number | "">("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [marketLocation, setMarketLocation] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [dateObserved, setDateObserved] = useState(todayIso);
  const [timeObserved, setTimeObserved] = useState("");
  const [qualityGrade, setQualityGrade] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState("");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [averages, setAverages] = useState<ItemAveragesResponse | null>(null);
  const [averagesLoading, setAveragesLoading] = useState(false);
  const [outlierDialogOpen, setOutlierDialogOpen] = useState(false);
  const [serverWarning, setServerWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedItem = useMemo(
    () => items.find((i) => i.id === itemId) ?? null,
    [items, itemId],
  );

  const gradeOptions = useMemo(
    () => (selectedItem ? gradesForItem(selectedItem.name) : []),
    [selectedItem],
  );

  const outlier = useOutlierCheck(price, averages);

  // Restore draft or editing state
  useEffect(() => {
    if (editing) {
      const match = items.find((i) => i.name === editing.item_name);
      setItemId(match?.id ?? "");
      setUnit(editing.unit);
      setPrice(editing.price_value);
      setCity(editing.city);
      setMarketLocation(editing.market_location);
      setVendorName(editing.vendor_name);
      setDateObserved(editing.date_observed);
      setTimeObserved(editing.time_observed);
      setQualityGrade(editing.quality_grade);
      setQuantityAvailable(editing.quantity_available ?? "");
      setNotes(editing.notes);
      setLatitude(editing.latitude ? parseFloat(String(editing.latitude)) : null);
      setLongitude(editing.longitude ? parseFloat(String(editing.longitude)) : null);
      return;
    }
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as FormDraft;
      setItemId(draft.itemId);
      setUnit(draft.unit);
      setPrice(draft.price);
      setCity(draft.city);
      setMarketLocation(draft.marketLocation);
      setVendorName(draft.vendorName);
      setDateObserved(draft.dateObserved);
      setTimeObserved(draft.timeObserved);
      setQualityGrade(draft.qualityGrade);
      setQuantityAvailable(draft.quantityAvailable);
      setNotes(draft.notes);
      setLatitude(draft.latitude ?? null);
      setLongitude(draft.longitude ?? null);
    } catch {
      /* ignore */
    }
  }, [editing, items]);

  // Persist draft
  useEffect(() => {
    if (editing) return;
    const draft: FormDraft = {
      itemId,
      unit,
      price,
      city,
      marketLocation,
      vendorName,
      dateObserved,
      timeObserved,
      qualityGrade,
      quantityAvailable,
      notes,
      latitude,
      longitude,
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* quota */
    }
  }, [
    editing,
    itemId,
    unit,
    price,
    city,
    marketLocation,
    vendorName,
    dateObserved,
    timeObserved,
    qualityGrade,
    quantityAvailable,
    notes,
    latitude,
    longitude,
  ]);

  // Auto-fill from last submission for same item
  useEffect(() => {
    if (editing || !itemId || marketLocation) return;
    const last = recentSubmissions.find(
      (s) => s.item_name === selectedItem?.name,
    );
    if (last) {
      setCity(last.city);
      setMarketLocation(last.market_location);
    }
  }, [itemId, selectedItem, recentSubmissions, editing, marketLocation]);

  // Fetch price context
  useEffect(() => {
    if (!itemId) {
      setAverages(null);
      return;
    }
    const controller = new AbortController();
    setAveragesLoading(true);
    const params = new URLSearchParams({
      item_id: String(itemId),
      city,
    });
    if (marketLocation) params.set("location", marketLocation);

    fetch(
      `${API_BASE}/api/market/prices/item-averages/?${params}`,
      { credentials: "include", signal: controller.signal },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setAverages(itemAveragesSchema.parse(data));
      })
      .catch(() => setAverages(null))
      .finally(() => setAveragesLoading(false));

    return () => controller.abort();
  }, [itemId, city, marketLocation]);

  const duplicateToday = useMemo(() => {
    if (!itemId || !marketLocation || editing) return null;
    const today = todayIso();
    return recentSubmissions.find(
      (s) =>
        s.item_name === selectedItem?.name &&
        s.market_location.toLowerCase() === marketLocation.toLowerCase() &&
        s.date_observed === today &&
        s.status !== "rejected",
    );
  }, [itemId, marketLocation, recentSubmissions, selectedItem, editing]);

  const validate = useCallback(() => {
    const errors: Record<string, string> = {};
    if (itemId === "") errors.item = "Please select an item.";
    if (!unit.trim()) errors.unit = "Unit is required.";
    const p = parseFloat(price.replace(/,/g, ""));
    if (!price || Number.isNaN(p) || p <= 0) {
      errors.price = "Enter a valid positive price.";
    } else if (p > 999_999) {
      errors.price = "Price cannot exceed 999,999 ETB.";
    }
    if (!marketLocation.trim()) {
      errors.market = "Market or store name is required.";
    }
    if (!city.trim()) errors.city = "City is required.";
    if (dateObserved > todayIso()) {
      errors.date = "Future dates are not allowed.";
    }
    if (dateObserved < maxPastIso()) {
      errors.date = "Date must be within the last 7 days.";
    }
    if (notes.length > 500) errors.notes = "Notes must be 500 characters or less.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [itemId, unit, price, marketLocation, city, dateObserved, notes]);

  const submitInternal = useCallback(
    (confirmOutlier = false) => {
      if (!validate()) return;

      const formData = new FormData();
      if (editing) {
        /* update uses same fields */
      }
      formData.append("item_id", String(itemId));
      formData.append("price_value", price.replace(/,/g, ""));
      formData.append("unit", unit);
      formData.append("market_location", marketLocation);
      formData.append("city", city);
      formData.append("date_observed", dateObserved);
      formData.append("vendor_name", vendorName);
      formData.append("time_observed", timeObserved);
      formData.append("quality_grade", qualityGrade);
      if (quantityAvailable) {
        formData.append("quantity_available", quantityAvailable);
      }
      if (latitude !== null) {
        formData.append("latitude", String(latitude));
      }
      if (longitude !== null) {
        formData.append("longitude", String(longitude));
      }
      formData.append("notes", notes);
      formData.append("confirm_outlier", String(confirmOutlier));
      if (photo) formData.append("image", photo);

      startTransition(async () => {
        const result = editing
          ? await updatePriceSubmission(editing.id, formData)
          : await createPriceSubmission(formData);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        const warning = result.data.outlier_warning;
        if (warning && !confirmOutlier) {
          setServerWarning(warning);
          setOutlierDialogOpen(true);
          return;
        }

        setServerWarning(null);
        setSuccess(true);
        toast.success(
          editing
            ? "Submission updated and pending review."
            : "Thank you! Your submission is under review. You'll earn 10 points when approved.",
        );
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setPrice("");
        setMarketLocation("");
        setVendorName("");
        setNotes("");
        setLatitude(null);
        setLongitude(null);
        setPhoto(null);
        onSuccess?.();
        onEditComplete?.();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    },
    [
      validate,
      itemId,
      price,
      unit,
      marketLocation,
      city,
      dateObserved,
      vendorName,
      timeObserved,
      qualityGrade,
      quantityAvailable,
      notes,
      latitude,
      longitude,
      photo,
      editing,
      onSuccess,
      onEditComplete,
    ],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outlier && !serverWarning) {
      setOutlierDialogOpen(true);
      return;
    }
    submitInternal(false);
  };

  const startVoice = () => {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => {
        lang: string;
        onresult: (ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void;
        start: () => void;
      };
      SpeechRecognition?: new () => {
        lang: string;
        onresult: (ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void;
        start: () => void;
      };
    };
    const SR = w.webkitSpeechRecognition ?? w.SpeechRecognition;
    if (!SR) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-ET";
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript;
      if (text) setNotes((n) => (n ? `${n} ${text}` : text));
    };
    rec.start();
  };

  const isValid =
    itemId !== "" &&
    unit.trim() &&
    price &&
    parseFloat(price) > 0 &&
    marketLocation.trim() &&
    city.trim() &&
    !fieldErrors.date;

  return (
    <>
      <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
        {success && (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <AlertTitle>Submission received</AlertTitle>
            <AlertDescription>
              Pending moderation. You will earn contributor points when approved.
            </AlertDescription>
          </Alert>
        )}

        {duplicateToday && !editing && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <Lightbulb className="size-4" />
            <AlertTitle>Duplicate detected</AlertTitle>
            <AlertDescription>
              You already submitted {duplicateToday.item_name} today at{" "}
              {duplicateToday.market_location}. You can still submit a new price
              or edit the existing one from My Submissions below.
            </AlertDescription>
          </Alert>
        )}

        <section className="overflow-hidden rounded-xl border border-[#cbd5e1]/30 bg-white shadow-sm">
          <div className="p-8">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
              <Edit3 className="text-[#135bec]" size={20} />
              {editing ? "Edit submission" : "Item details"}
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <ItemSelector
                  items={items}
                  value={itemId}
                  onChange={(id, defaultUnit) => {
                    setItemId(id);
                    setUnit(defaultUnit);
                  }}
                  error={fieldErrors.item}
                />
              </div>
              <div>
                <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="border-none bg-[#f0f2f4]"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
                {fieldErrors.unit && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.unit}</p>
                )}
              </div>
              <div>
                <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
                  Date observed <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  className="border-none bg-[#f0f2f4]"
                  value={dateObserved}
                  min={maxPastIso()}
                  max={todayIso()}
                  onChange={(e) => setDateObserved(e.target.value)}
                />
                {fieldErrors.date && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.date}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <PriceInput
                  value={price}
                  onChange={setPrice}
                  error={fieldErrors.price}
                />
              </div>
              <div>
                <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
                  Time (optional)
                </Label>
                <select
                  className="w-full rounded-lg border-none bg-[#f0f2f4] p-3 text-sm"
                  value={timeObserved}
                  onChange={(e) => setTimeObserved(e.target.value)}
                >
                  <option value="">—</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
              {gradeOptions.length > 0 && (
                <div>
                  <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
                    Quality / grade
                  </Label>
                  <select
                    className="w-full rounded-lg border-none bg-[#f0f2f4] p-3 text-sm"
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                  >
                    <option value="">—</option>
                    {gradeOptions.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
                  Quantity available
                </Label>
                <Input
                  type="number"
                  className="border-none bg-[#f0f2f4]"
                  placeholder="Optional"
                  value={quantityAvailable}
                  onChange={(e) => setQuantityAvailable(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#616f89]">
                  Specific shop / vendor
                </Label>
                <Input
                  className="border-none bg-[#f0f2f4]"
                  placeholder="Which shop specifically?"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#cbd5e1]/30 bg-[#f0f2f4]/50 p-8">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
              <MapPin className="text-[#135bec]" size={20} />
              Market location
            </h3>
            <LocationPicker
              city={city}
              marketLocation={marketLocation}
              onCityChange={setCity}
              onMarketChange={setMarketLocation}
              latitude={latitude}
              longitude={longitude}
              onLatitudeChange={setLatitude}
              onLongitudeChange={setLongitude}
              errors={{ city: fieldErrors.city, market: fieldErrors.market }}
            />
          </div>

          <div className="border-t border-[#cbd5e1]/30 p-8">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Camera className="text-[#135bec]" size={20} />
              Photo evidence
            </h3>
            <PhotoUploader file={photo} onChange={setPhoto} />
          </div>

          <div className="border-t border-[#cbd5e1]/30 p-8">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#616f89]">
                Notes (optional)
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={startVoice}
              >
                <Mic className="size-4" />
                Voice
              </Button>
            </div>
            <Textarea
              className="min-h-[100px] border-none bg-[#f0f2f4]"
              placeholder="Any context? e.g. limited stock, festival pricing"
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="mt-1 text-right text-xs text-[#616f89]">
              {notes.length}/500
            </p>
          </div>

          <div className="flex justify-end border-t border-[#cbd5e1]/30 p-6 md:p-8">
            <Button
              type="submit"
              disabled={!isValid || isPending}
              className="w-full bg-[#135bec] font-bold md:w-auto md:px-8"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Price"
              )}
            </Button>
          </div>
        </section>
      </form>

      <aside className="space-y-6 lg:col-span-4">
        <div className="lg:sticky lg:top-8">
          <PriceContextPanel
            averages={averages}
            loading={averagesLoading}
            itemName={selectedItem?.name}
          />
          <div className="mt-6">
            <ContributorStats stats={stats} />
          </div>
        </div>
      </aside>

      <OutlierWarning
        open={outlierDialogOpen}
        onOpenChange={setOutlierDialogOpen}
        outlier={outlier}
        serverWarning={serverWarning}
        onConfirm={() => {
          setOutlierDialogOpen(false);
          submitInternal(true);
        }}
      />
    </>
  );
}
