import { apiClient } from '@/lib/api';
import {
    ItemResponse,
    PriceAverageResponse,
    PriceHistoryResponse,
    PriceTrendPoint,
    ProductDetailResponse,
    SimilarProductResponse,
    VendorPriceComparisonResponse,
} from '@/types/api/product-details';
import { z } from 'zod';
import {
    itemResponseSchema,
    priceHistorySchema,
    priceSubmissionSchema,
    priceTrendPointSchema,
    productDetailSchema,
    similarProductSchema,
    vendorPriceComparisonSchema,
} from './validation/product-details';

// Helper: calculate date range from timeRange string
function getDateRange(timeRange: string): { from_date: string; to_date: string } {
  const to = new Date();
  const from = new Date();
  switch (timeRange) {
    case '1W': from.setDate(to.getDate() - 7); break;
    case '1M': from.setMonth(to.getMonth() - 1); break;
    case '3M': from.setMonth(to.getMonth() - 3); break;
    case '1Y': from.setFullYear(to.getFullYear() - 1); break;
    case 'ALL': from.setFullYear(2020, 0, 1); break;
    case '6M':
    default:
      from.setMonth(to.getMonth() - 6);
  }
  return {
    from_date: from.toISOString().split('T')[0],
    to_date: to.toISOString().split('T')[0],
  };
}

/**
 * GET /api/market/items/<itemId>/
 * Fetches the raw item then enriches it with pricing data.
 */
export async function getProductDetail(itemId: string): Promise<ProductDetailResponse> {
  const [rawItem, priceAverages, vendorPrices] = await Promise.all([
    apiClient<ItemResponse>({
      method: 'GET',
      endpoint: `/api/market/items/${itemId}`,
      next: { tags: [`product:${itemId}`], revalidate: 60 },
    }),
    apiClient<PriceAverageResponse[]>({
      method: 'GET',
      endpoint: '/api/market/prices/averages',
      query: { item_id: itemId },
      next: { tags: [`product:${itemId}:averages`], revalidate: 60 },
    }).catch(() => [] as PriceAverageResponse[]),
    apiClient<VendorPriceComparisonResponse[]>({
      method: 'GET',
      endpoint: '/api/market/vendors/prices',
      query: { item_id: itemId },
      next: { tags: [`product:${itemId}:vendors`], revalidate: 60 },
    }).catch(() => [] as VendorPriceComparisonResponse[]),
  ]);

  const item = itemResponseSchema.parse(rawItem);
  const averages = z.array(priceSubmissionSchema).catch([]).parse(priceAverages);
  const vendors = z.array(vendorPriceComparisonSchema).catch([]).parse(vendorPrices);

  // Calculate current average price from all city averages
  const avgPrices = averages.map(a => parseFloat(a.average_price)).filter(Boolean);
  const currentAveragePrice =
    avgPrices.length > 0
      ? avgPrices.reduce((sum, p) => sum + p, 0) / avgPrices.length
      : 0;

  // Calculate national average from vendor prices
  const vendorPriceValues = vendors.map(v => parseFloat(v.price)).filter(Boolean);
  const nationalAveragePrice =
    vendorPriceValues.length > 0
      ? vendorPriceValues.reduce((sum, p) => sum + p, 0) / vendorPriceValues.length
      : currentAveragePrice;

  // Find lowest/highest vendor
  let lowestPrice: ProductDetailResponse['lowestPrice'] = null;
  let highestPrice: ProductDetailResponse['highestPrice'] = null;
  if (vendors.length > 0) {
    const sorted = [...vendors].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    lowestPrice = { price: parseFloat(low.price), vendorName: low.vendor_name, location: low.city };
    highestPrice = { price: parseFloat(high.price), vendorName: high.vendor_name, location: high.city };
  }

  // ItemSerializer returns a relative image path; build a full URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let realImageUrl = item.image_url || item.image || "";
  if (realImageUrl && !realImageUrl.startsWith('http')) {
    if (realImageUrl.startsWith('/media/')) {
      realImageUrl = `${API_BASE}${realImageUrl}`;
    } else if (realImageUrl.startsWith('media/')) {
      realImageUrl = `${API_BASE}/${realImageUrl}`;
    } else if (realImageUrl.startsWith('/')) {
      realImageUrl = `${API_BASE}${realImageUrl}`;
    } else {
      realImageUrl = `${API_BASE}/media/${realImageUrl}`;
    }
  }
  const imageUrls = realImageUrl ? [realImageUrl] : [];

  const composed: ProductDetailResponse = {
    id: String(item.id),
    name: item.name,
    category: item.category,
    unit: item.unit,
    description: item.description || `${item.name} — sold per ${item.unit}.`,
    imageUrls,
    currentAveragePrice,
    priceTrend: 0,
    priceTrendDirection: 'stable',
    lastUpdated: new Date().toISOString(),
    lowestPrice,
    highestPrice,
    nationalAveragePrice,
  };

  return productDetailSchema.parse(composed);
}

/**
 * GET /api/market/trends/?item_id=<itemId>&from_date=...&to_date=...
 */
export async function getPriceHistory(
  itemId: string,
  timeRange?: string
): Promise<PriceHistoryResponse> {
  const range = timeRange || '6M';
  const { from_date, to_date } = getDateRange(range);

  const [rawTrends, rawForecasts] = await Promise.all([
    apiClient<PriceTrendPoint[]>({
      method: 'GET',
      endpoint: '/api/market/trends',
      query: { item_id: itemId, from_date, to_date },
      next: { tags: [`product:${itemId}:history`], revalidate: 60 },
    }),
    apiClient<any[]>({
      method: 'GET',
      endpoint: '/api/market/forecasts',
      query: { item_id: itemId },
      next: { tags: [`product:${itemId}:forecast`], revalidate: 60 },
    }).catch(() => [] as any[]),
  ]);

  const trendPoints = z.array(priceTrendPointSchema).catch([]).parse(rawTrends);

  const dataPoints = trendPoints.map(p => ({
    date: p.date,
    price: parseFloat(p.average_price),
    isForecast: false,
    isLastHistorical: false,
    confidenceInterval: undefined as [number, number] | undefined,
    confidenceLow: undefined as number | undefined,
    confidenceHigh: undefined as number | undefined,
  }));

  // Connect forecast line to historical line continuously
  if (dataPoints.length > 0) {
    dataPoints[dataPoints.length - 1].isLastHistorical = true;
    
    // Set confidence low/high on the last historical point equal to its price to start the band cleanly
    dataPoints[dataPoints.length - 1].confidenceLow = dataPoints[dataPoints.length - 1].price;
    dataPoints[dataPoints.length - 1].confidenceHigh = dataPoints[dataPoints.length - 1].price;
    dataPoints[dataPoints.length - 1].confidenceInterval = [
      dataPoints[dataPoints.length - 1].price,
      dataPoints[dataPoints.length - 1].price
    ] as [number, number];
  }

  const forecastPoints = rawForecasts.map((f: any) => {
    const price = parseFloat(f.predicted_price);
    const low = f.confidence_low ? parseFloat(f.confidence_low) : price;
    const high = f.confidence_high ? parseFloat(f.confidence_high) : price;
    return {
      date: f.forecast_date,
      price,
      isForecast: true,
      isLastHistorical: false,
      confidenceInterval: [low, high] as [number, number],
      confidenceLow: low,
      confidenceHigh: high,
    };
  });

  const combinedPoints = [...dataPoints, ...forecastPoints];

  const composed: PriceHistoryResponse = {
    itemId,
    timeRange: range,
    dataPoints: combinedPoints,
    nationalAverageDataPoints: dataPoints.map(d => ({ date: d.date, price: d.price })),
  };

  return priceHistorySchema.parse(composed);
}

/**
 * GET /api/market/vendors/prices/?item_id=<itemId>
 */
export async function getVendorPriceComparisons(itemId: string, _location?: string) {
  const raw = await apiClient<VendorPriceComparisonResponse[]>({
    method: 'GET',
    endpoint: '/api/market/vendors/prices',
    query: { item_id: itemId },
    next: { tags: [`product:${itemId}:vendors`], revalidate: 60 },
  });

  return z.array(vendorPriceComparisonSchema).catch([]).parse(raw);
}

/**
 * GET /api/market/items/?category=<category>
 * Fetches the item first to get its category, then fetches others in the same category.
 */
export async function getSimilarProducts(itemId: string) {
  // Get item category first
  const rawItem = await apiClient<ItemResponse>({
    method: 'GET',
    endpoint: `/api/market/items/${itemId}`,
    next: { tags: [`product:${itemId}`], revalidate: 300 },
  });

  const item = itemResponseSchema.parse(rawItem);

  const raw = await apiClient<SimilarProductResponse[]>({
    method: 'GET',
    endpoint: '/api/market/items',
    query: { category: item.category },
    next: { tags: [`category:${item.category}`], revalidate: 300 },
  });

  const items = z.array(similarProductSchema).catch([]).parse(raw);

  // Exclude the current item
  return items.filter(i => String(i.id) !== String(itemId)).slice(0, 6);
}

/**
 * GET /api/market/prices/averages/?item_id=<itemId>
 * Returns per-city average prices as "recent submissions".
 */
export async function getRecentPriceSubmissions(itemId: string) {
  const raw = await apiClient<PriceAverageResponse[]>({
    method: 'GET',
    endpoint: '/api/market/prices/averages',
    query: { item_id: itemId },
    next: { tags: [`product:${itemId}:submissions`], revalidate: 60 },
  });

  return z.array(priceSubmissionSchema).catch([]).parse(raw);
}
