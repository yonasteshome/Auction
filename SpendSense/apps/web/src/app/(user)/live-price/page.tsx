import { ApiError } from "@/lib/api";
import { getMarketItems } from "@/lib/market";
import {
  getInflationData,
  getMarketForecasts,
  getLivePrices,
  getPriceTrends,
  getPriceAlerts,
} from "@/lib/market-data";
import { LivePriceClient } from "./live-price-client";

type PageProps = {
  searchParams?: Promise<{
    city?: string;
    item_id?: string;
    range?: string;
    search?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

function getFromDate(range: string | undefined) {
  const d = new Date();
  if (range === "1M") d.setMonth(d.getMonth() - 1);
  else if (range === "6M") d.setMonth(d.getMonth() - 6);
  else if (range === "1Y") d.setFullYear(d.getFullYear() - 1);
  else d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}

export default async function PriceTrendsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCity = params?.city || "All Regions";
  const activeRange = params?.range || "3M";
  const activeSearch = params?.search || "";
  const activeCategory = params?.category || "All Categories";
  const activeSort = params?.sort || "name";
  const activePage = params?.page ? parseInt(params.page, 10) : 1;

  const chartCity = activeCity === "All Regions" ? "Addis Ababa" : activeCity;

  try {
    const [items, livePrices, alerts] = await Promise.all([
      getMarketItems(),
      getLivePrices({
        search: activeSearch || undefined,
        category: activeCategory && activeCategory !== "All Categories" ? activeCategory : undefined,
        city: activeCity && activeCity !== "All Regions" ? activeCity : undefined,
        sort: activeSort || undefined,
        page: activePage,
        page_size: 10,
      }),
      getPriceAlerts(),
    ]);

    const parsedItemId = Number.parseInt(params?.item_id ?? "", 10);
    const selectedItemId = Number.isFinite(parsedItemId)
      ? parsedItemId
      : items[0]?.id ?? null;

    const [inflation, trends, forecasts] =
      selectedItemId === null
        ? [null, [], []]
        : await Promise.all([
            getInflationData({
              city: chartCity,
              item_id: selectedItemId,
              period: "month",
            }).catch(() => null),
            getPriceTrends({
              item_id: selectedItemId,
              city: chartCity,
              from_date: getFromDate(activeRange),
            }).catch(() => []),
            getMarketForecasts({
              item_id: selectedItemId,
              city: chartCity,
              forecast_weeks: 4,
            }).catch(() => []),
          ]);

    return (
      <LivePriceClient
        initialLivePrices={livePrices}
        chartCity={chartCity}
        chartForecasts={forecasts}
        chartInflation={inflation}
        chartRange={activeRange}
        chartTrends={trends}
        initialError={null}
        items={items}
        selectedChartItemId={selectedItemId}
        initialAlerts={alerts}
      />
    );
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Unable to load market data. The server might be down or unreachable.";
    return (
      <LivePriceClient
        initialLivePrices={{
          results: [],
          pagination: { total_records: 0, total_pages: 1, page_size: 10, current_page: 1 },
          categories: [],
          cities: [],
          last_updated: new Date().toISOString(),
          summaries: {
            avgBasketCost: null,
            mostVolatileName: null,
            mostVolatileCount: 0,
            bestValueCity: null,
            bestValuePrice: null,
          },
        }}
        chartCity={chartCity}
        chartForecasts={[]}
        chartInflation={null}
        chartRange={activeRange}
        chartTrends={[]}
        initialError={message}
        items={[]}
        selectedChartItemId={null}
        initialAlerts={[]}
      />
    );
  }
}
