import { ApiError } from "@/lib/api";
import { getMarketItems } from "@/lib/market";
import {
  getInflationData,
  getItemVendorPrices,
  getMarketForecasts,
  getMarketItem,
  getPriceAverages,
  getPriceTrends,
} from "@/lib/market-data";
import { MarketItemDetailClient } from "./market-item-detail-client";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getFromDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
}

export default async function MarketItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const itemId = Number.parseInt(id, 10);

  if (!Number.isFinite(itemId)) {
    return (
      <MarketItemDetailClient
        averages={[]}
        chartForecasts={[]}
        chartInflation={null}
        chartTrends={[]}
        error="Invalid product ID."
        item={null}
        items={[]}
        vendors={[]}
      />
    );
  }

  try {
    const [item, averages, inflation, vendors, items, trends, forecasts] =
      await Promise.all([
        getMarketItem(itemId),
        getPriceAverages({ item_id: itemId }),
        getInflationData({ item_id: itemId, period: "month" }).catch(() => null),
        getItemVendorPrices(itemId).catch(() => []),
        getMarketItems().catch(() => []),
        getPriceTrends({
          item_id: itemId,
          city: "Addis Ababa",
          from_date: getFromDate(),
        }).catch(() => []),
        getMarketForecasts({
          item_id: itemId,
          city: "Addis Ababa",
          forecast_weeks: 4,
        }).catch(() => []),
      ]);

    return (
      <MarketItemDetailClient
        averages={averages}
        chartForecasts={forecasts}
        chartInflation={inflation}
        chartTrends={trends}
        error={null}
        item={item}
        items={items.length > 0 ? items : [item]}
        vendors={vendors}
      />
    );
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "We couldn't find the requested market item. It may have been removed or the ID is incorrect.";

    return (
      <MarketItemDetailClient
        averages={[]}
        chartForecasts={[]}
        chartInflation={null}
        chartTrends={[]}
        error={message}
        item={null}
        items={[]}
        vendors={[]}
      />
    );
  }
}
