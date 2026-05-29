"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell, BellOff, MapPin, Minus, Plus, ShoppingBasket,
  Store, TrendingDown, TrendingUp, ArrowUpRight, RefreshCw,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Suspense } from "react";
import { MarketTrendsChart } from "@/components/market/market-trends-chart";
import { MarketFilterBar, type SortOption } from "@/components/market/market-filter-bar";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { AlertCircle, SearchX } from "lucide-react";
import type { MarketItem } from "@/types/api/vendor";
import type {
  ForecastPoint,
  InflationResponse,
  PriceAverageRow,
  TrendPoint,
  PriceAlert,
  LivePriceResponse,
} from "@/types/api/market";
import { deletePriceAlert } from "@/actions/price-alerts";
import { PriceAlertModal } from "@/components/product-detail/price-alert-modal";
import { toast } from "sonner";
import { useQueryState, parseAsInteger } from "nuqs";
import { useRealtime } from "@/providers/realtime-provider";

const PAGE_SIZE = 10;

type AlertSet = Record<number, boolean>;

type LivePriceClientProps = {
  initialLivePrices: LivePriceResponse;
  chartCity: string;
  chartForecasts: ForecastPoint[];
  chartInflation: InflationResponse | null;
  chartRange: string;
  chartTrends: TrendPoint[];
  initialError: string | null;
  items: MarketItem[];
  selectedChartItemId: number | null;
  initialAlerts: PriceAlert[];
};

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-[#616f89]">—</span>;
  if (Math.abs(pct) < 0.5)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
        <Minus className="size-3.5" /> {pct.toFixed(1)}%
      </span>
    );
  if (pct > 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
        <TrendingUp className="size-3.5" /> +{pct.toFixed(1)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
      <TrendingDown className="size-3.5" /> {pct.toFixed(1)}%
    </span>
  );
}

export function LivePriceClient({
  initialLivePrices,
  chartCity,
  chartForecasts,
  chartInflation,
  chartRange,
  chartTrends,
  initialError,
  items,
  selectedChartItemId,
  initialAlerts = [],
}: LivePriceClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search parameters bound to URL via nuqs
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });
  const [category, setCategory] = useQueryState("category", {
    defaultValue: "All Categories",
    shallow: false,
    clearOnDefault: true,
  });
  const [city, setCity] = useQueryState("city", {
    defaultValue: "All Regions",
    shallow: false,
    clearOnDefault: true,
  });
  const [sort, setSort] = useQueryState("sort", {
    defaultValue: "name",
    shallow: false,
    clearOnDefault: true,
  });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  const loading = isPending;
  const error = initialError;

  const [livePrices, setLivePrices] = useState<LivePriceResponse>(initialLivePrices);
  const [flashingRows, setFlashingRows] = useState<Record<number, "up" | "down" | "neutral">>({});

  // Sync state with incoming props (triggered by searchParams updates)
  useEffect(() => {
    setLivePrices(initialLivePrices);
  }, [initialLivePrices]);

  const [alerts, setAlerts] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {};
    for (const a of initialAlerts) {
      map[a.item] = a.id;
    }
    return map;
  });
  const [modalItemId, setModalItemId] = useState<number | null>(null);

  useEffect(() => {
    const map: Record<number, number> = {};
    for (const a of initialAlerts) {
      map[a.item] = a.id;
    }
    setAlerts(map);
  }, [initialAlerts]);

  const [selectedItem, setSelectedItem] = useState<number | null>(selectedChartItemId);
  const { socket } = useRealtime();

  // Real-time market price updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit("subscribe:market_prices");

    const handlePriceUpdated = (payload: {
      item_id: number;
      item_name: string;
      city: string;
      average_price: string;
      count: number;
      timestamp: string;
    }) => {
      setLivePrices((prev) => {
        const itemIndex = prev.results.findIndex((r) => r.id === payload.item_id);
        if (itemIndex === -1) return prev;

        const updatedResults = [...prev.results];
        const item = updatedResults[itemIndex];
        if (!item) return prev;

        const parsedPrice = parseFloat(payload.average_price);
        const oldPrice = item.avgPrice;
        let direction: "up" | "down" | "neutral" = "neutral";

        const cityFilterMatches = city.toLowerCase() === payload.city.toLowerCase();
        const isAllRegions = city === "All Regions";

        // Determine flash direction based on price trend direction
        if (cityFilterMatches && oldPrice !== null && oldPrice !== undefined) {
          direction = parsedPrice > oldPrice ? "up" : parsedPrice < oldPrice ? "down" : "neutral";
        } else if (isAllRegions && oldPrice !== null && oldPrice !== undefined) {
          direction = parsedPrice > oldPrice ? "up" : parsedPrice < oldPrice ? "down" : "neutral";
        }

        // Trigger flash
        setFlashingRows((flashes) => ({
          ...flashes,
          [payload.item_id]: direction,
        }));

        // Clear flash after 2 seconds
        setTimeout(() => {
          setFlashingRows((flashes) => {
            const next = { ...flashes };
            delete next[payload.item_id];
            return next;
          });
        }, 2000);

        // Update item average price and submission count based on active filters
        let nextAvgPrice = item.avgPrice;
        let nextSubCount = item.submissionCount;

        if (cityFilterMatches) {
          nextAvgPrice = parsedPrice;
          nextSubCount = payload.count;
        } else if (isAllRegions) {
          nextSubCount = item.submissionCount + 1;
          if (oldPrice !== null && oldPrice !== undefined) {
            nextAvgPrice = (oldPrice * item.submissionCount + parsedPrice) / (item.submissionCount + 1);
          } else {
            nextAvgPrice = parsedPrice;
          }
        }

        // Update best price and location if the new price is lower or if the updated city is currently the best city
        let nextBestPrice = item.bestPrice;
        let nextBestCity = item.bestCity;
        if (
          nextBestPrice === null ||
          nextBestPrice === undefined ||
          parsedPrice < nextBestPrice ||
          payload.city.toLowerCase() === nextBestCity?.toLowerCase()
        ) {
          nextBestPrice = parsedPrice;
          nextBestCity = payload.city;
        }

        updatedResults[itemIndex] = {
          ...item,
          avgPrice: nextAvgPrice,
          submissionCount: nextSubCount,
          bestPrice: nextBestPrice,
          bestCity: nextBestCity,
        };

        // Update avg basket cost in summaries
        const updatedSummaries = { ...prev.summaries };
        if (updatedSummaries.avgBasketCost && oldPrice !== null && oldPrice !== undefined && nextAvgPrice !== null && nextAvgPrice !== undefined) {
          updatedSummaries.avgBasketCost = (updatedSummaries.avgBasketCost * prev.results.length - oldPrice + nextAvgPrice) / prev.results.length;
        }

        return {
          ...prev,
          results: updatedResults,
          last_updated: payload.timestamp,
          summaries: updatedSummaries,
        };
      });
    };

    socket.on("price_updated", handlePriceUpdated);

    return () => {
      socket.off("price_updated", handlePriceUpdated);
    };
  }, [socket, city]);

  const inflation = chartInflation?.change_percent ?? null;
  const categories = livePrices.categories || [];
  const cities = livePrices.cities || [];

  const handleSearchChange = (val: string) => {
    startTransition(() => {
      void setSearch(val || null);
      void setPage(null);
    });
  };

  const handleCategoryChange = (val: string) => {
    startTransition(() => {
      void setCategory(val === "All Categories" ? null : val);
      void setPage(null);
    });
  };

  const handleCityChange = (val: string) => {
    startTransition(() => {
      void setCity(val === "All Regions" ? null : val);
      void setPage(null);
    });
  };

  const handleSortChange = (val: SortOption) => {
    startTransition(() => {
      void setSort(val === "name" ? null : val);
      void setPage(null);
    });
  };

  const handlePageChange = (p: number) => {
    startTransition(() => {
      void setPage(p === 1 ? null : p);
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      void setSearch(null);
      void setCategory(null);
      void setCity(null);
      void setPage(null);
    });
  };

  const refreshData = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleAlertClick = (itemId: number) => {
    const activeAlertId = alerts[itemId];
    if (activeAlertId) {
      startTransition(async () => {
        const result = await deletePriceAlert(String(activeAlertId));
        if (result.success) {
          toast.success("Price alert removed.");
          setAlerts((prev) => {
            const next = { ...prev };
            delete next[itemId];
            return next;
          });
          router.refresh();
        } else {
          toast.error(result.message || "Failed to remove price alert");
        }
      });
    } else {
      setModalItemId(itemId);
    }
  };

  // Summary stats calculations
  const totalItems = livePrices.pagination.total_records;
  const avgBasketCost = livePrices.summaries.avgBasketCost
    ? String(livePrices.summaries.avgBasketCost)
    : null;
  const mostVolatile = livePrices.summaries.mostVolatileName
    ? { name: livePrices.summaries.mostVolatileName, submissionCount: livePrices.summaries.mostVolatileCount }
    : null;
  const bestValue = livePrices.summaries.bestValueCity
    ? { city: livePrices.summaries.bestValueCity, average_price: String(livePrices.summaries.bestValuePrice) }
    : null;

  const totalPages = livePrices.pagination.total_pages;
  const pageItems = livePrices.results;
  const lastUpdated = livePrices.last_updated;

  return (
    <div className="pb-12 lg:pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#111318] dark:text-white tracking-tight">
            Current Market Prices
          </h1>
          <p className="text-[#616f89] dark:text-gray-400 text-base mt-1">
            Live tracking of essential goods across Ethiopia — {totalItems} items tracked.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-[#616f89] hover:text-[#135bec] transition-colors"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 px-3 py-1.5 rounded-full border border-green-100 w-fit">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide">
              Live • {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="mb-8 border-red-200/50 bg-red-50/50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={refreshData} className="h-7 px-3 text-xs bg-white dark:bg-slate-900 border-red-200 hover:bg-red-50">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 lg:mb-12">
        <SummaryCard
          icon={<ShoppingBasket className="size-5" />}
          iconBg="bg-blue-50 dark:bg-blue-900/20 text-[#135bec]"
          label="Avg. Price / Item"
          value={avgBasketCost ? `${parseInt(avgBasketCost).toLocaleString()} ETB` : loading ? "…" : "No data"}
          badge={inflation !== null ? `${inflation > 0 ? "+" : ""}${inflation.toFixed(1)}% vs last month` : undefined}
          badgeColor={inflation !== null && inflation > 0 ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "text-green-600 bg-green-50 dark:bg-green-900/20"}
        />
        <SummaryCard
          icon={<TrendingUp className="size-5" />}
          iconBg="bg-orange-50 dark:bg-orange-900/20 text-orange-600"
          label="Most Submitted Item"
          value={mostVolatile?.name ?? (loading ? "…" : "—")}
          badge={mostVolatile ? `${mostVolatile.submissionCount} submissions` : undefined}
          badgeColor="text-orange-600 bg-orange-50 dark:bg-orange-900/20"
        />
        <SummaryCard
          icon={<Store className="size-5" />}
          iconBg="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
          label="Best Value Location"
          value={bestValue?.city ?? (loading ? "…" : "—")}
          badge={bestValue ? `${parseFloat(bestValue.average_price).toLocaleString()} ETB avg.` : undefined}
          badgeColor="text-gray-600 bg-gray-100 dark:bg-gray-800"
        />
      </div>

      {/* Chart */}
      <Suspense fallback={<ChartSkeleton />}>
        <MarketTrendsChart
          forecasts={chartForecasts}
          inflation={chartInflation}
          initialCity={chartCity}
          initialItemId={selectedChartItemId}
          initialRange={chartRange}
          items={items}
          trends={chartTrends}
        />
      </Suspense>

      {/* Filter Bar */}
      <MarketFilterBar
        search={search} onSearch={handleSearchChange}
        category={category} onCategory={handleCategoryChange}
        city={city} onCity={handleCityChange}
        sort={(sort as SortOption) || "name"} onSort={handleSortChange}
        categories={categories} cities={cities}
      />

      {/* Table */}
      <div className="bg-white dark:bg-[#1e2330] rounded-2xl border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm overflow-hidden">
        {loading && <TableSkeleton />}
        {!loading && pageItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4 text-[#616f89]">
            <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-2">
              <SearchX className="size-10 opacity-40 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">No results found</p>
              <p className="text-sm mt-1 max-w-xs mx-auto">We couldn't find any items matching your current filters. Try adjusting your search or category.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleResetFilters} 
              className="mt-2"
            >
              Reset all filters
            </Button>
          </div>
        )}
        {!loading && pageItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#f9fafb] dark:bg-[#252b38] border-b border-[#e5e7eb] dark:border-[#2a3140]">
                  <th className="py-3.5 pl-6 pr-4 text-xs font-semibold uppercase tracking-wider text-[#616f89]">Item</th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89]">Unit</th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89]">Avg. Price</th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#135bec]">Best Price</th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89]">Best Location</th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#616f89] text-center">Submissions</th>
                  <th className="py-3.5 pr-6 pl-4 text-xs font-semibold uppercase tracking-wider text-[#616f89] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3140]">
                {pageItems.map((row) => {
                  const isSelected = selectedItem === row.id;
                  const flashStatus = flashingRows[row.id];
                  const flashClass = flashStatus === "up"
                    ? "bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100 animate-pulse"
                    : flashStatus === "down"
                    ? "bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100 animate-pulse"
                    : flashStatus === "neutral"
                    ? "bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 animate-pulse"
                    : isSelected
                    ? "bg-blue-50/60 dark:bg-blue-900/10"
                    : "";
                  return (
                    <tr
                      key={row.id}
                      className={`group hover:bg-[#f0f9ff] dark:hover:bg-[#1f2937]/50 transition-all duration-300 cursor-pointer ${flashClass}`}
                      onClick={() => setSelectedItem(row.id)}
                    >
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#135bec]/10 to-[#135bec]/20 flex items-center justify-center shrink-0 text-[#135bec] font-bold text-sm">
                          {row.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111318] dark:text-white">{row.name}</p>
                          <span className="text-xs text-[#616f89]">{row.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#616f89]">{row.unit}</td>
                    <td className="py-4 px-4 text-sm font-medium text-[#111318] dark:text-white tabular-nums">
                      {row.avgPrice !== null && row.avgPrice !== undefined ? `${row.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB` : <span className="text-[#616f89] text-xs">No data</span>}
                    </td>
                    <td className="py-4 px-4">
                      {row.bestPrice !== null && row.bestPrice !== undefined ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[#135bec] text-sm font-bold tabular-nums border border-blue-100 dark:border-blue-800">
                          {row.bestPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB
                        </span>
                      ) : <span className="text-xs text-[#616f89]">—</span>}
                    </td>
                    <td className="py-4 px-4 text-sm text-[#616f89]">
                      {row.bestCity ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0" />
                          <span>{row.bestCity}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${row.submissionCount > 0 ? "bg-[#135bec]/10 text-[#135bec]" : "bg-gray-100 text-gray-400"}`}>
                        {row.submissionCount}
                      </span>
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          title={alerts[row.id] ? "Remove alert" : "Set price alert"}
                          onClick={() => handleAlertClick(row.id)}
                          className={`p-2 rounded-full transition-colors ${alerts[row.id] ? "text-[#135bec] bg-blue-50 dark:bg-blue-900/20" : "text-[#616f89] hover:text-[#135bec] hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        >
                          {alerts[row.id] ? <BellOff className="size-4" /> : <Bell className="size-4" />}
                        </button>
                        <Link
                          href={`/market/submit?item_id=${row.id}`}
                          title="Submit price"
                          className="p-2 rounded-full text-[#616f89] hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          <Plus className="size-4" />
                        </Link>
                        <Link
                          href={`/market/${row.id}`}
                          title="View detailed trends"
                          className="p-2 rounded-full text-[#616f89] hover:text-[#135bec] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pageItems.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-[#f9fafb] dark:bg-[#252b38] border-t border-[#e5e7eb] dark:border-[#2a3140]">
            <p className="text-sm text-[#616f89]">
              Showing <span className="font-semibold text-[#111318] dark:text-white">{(page - 1) * livePrices.pagination.page_size + 1}</span>–
              <span className="font-semibold text-[#111318] dark:text-white">{Math.min((page - 1) * livePrices.pagination.page_size + pageItems.length, totalItems)}</span> of{" "}
              <span className="font-semibold text-[#111318] dark:text-white">{totalItems}</span> items
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                disabled={page === 1}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-[#135bec] text-white" : "text-[#616f89] hover:bg-[#f0f2f4] dark:hover:bg-[#374151]"}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline" size="sm"
                disabled={page === totalPages}
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Submit CTA */}
      <div className="mt-8 rounded-xl bg-gradient-to-r from-[#135bec] to-[#0d4fd4] p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-lg">
        <div>
          <h3 className="text-lg font-bold">Help keep prices accurate</h3>
          <p className="text-sm text-white/80 mt-1">Contribute real prices from your local market and earn contributor points.</p>
        </div>
        <Button asChild className="bg-white text-[#135bec] hover:bg-blue-50 font-bold shrink-0">
          <Link href="/market/submit">Submit a Price <ArrowUpRight className="size-4 ml-1" /></Link>
        </Button>
      </div>

      {modalItemId !== null && (
        <PriceAlertModal
          itemId={String(modalItemId)}
          isOpen={modalItemId !== null}
          city={city !== "All Regions" ? city : undefined}
          onClose={() => {
            setModalItemId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="mb-8 p-6 rounded-2xl border border-slate-200 bg-white dark:bg-[#1e2330] dark:border-slate-800">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      <div className="bg-slate-50 dark:bg-slate-900/50 h-12 flex items-center px-6">
        <Skeleton className="h-4 w-full" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="py-4 px-6 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/6" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ icon, iconBg, label, value, badge, badgeColor }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string;
  badge?: string; badgeColor?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#2a3140] shadow-sm flex flex-col group hover:border-[#135bec]/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${iconBg} shadow-sm`}>{icon}</div>
        {badge && <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tight ${badgeColor}`}>{badge}</span>}
      </div>
      <p className="text-[#616f89] dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-xl md:text-2xl font-black text-[#111318] dark:text-white mt-1 tabular-nums">{value}</p>
    </div>
  );
}
