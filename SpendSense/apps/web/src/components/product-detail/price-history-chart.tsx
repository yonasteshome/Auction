"use client";
 
import { PriceHistoryResponse } from "@/types/api/product-details";
import { ChartTimeRange } from "./chart-time-range";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { TrendingUp, TrendingDown, Activity, Info, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceHistoryChartProps {
  history: PriceHistoryResponse;
  currentPrice: number;
}

export function PriceHistoryChart({ history, currentPrice }: PriceHistoryChartProps) {
  const hasData = history.dataPoints && history.dataPoints.length > 0;
  
  // Format data for Recharts
  const formattedData = history.dataPoints.map(point => {
    let dispDate = "";
    try {
      dispDate = format(parseISO(point.date), "MMM d");
    } catch {
      dispDate = point.date;
    }
    return {
      ...point,
      displayDate: dispDate,
    };
  });

  // Find where the forecast starts
  const forecastStartIndex = formattedData.findIndex(d => d.isForecast);
  const forecastDate = forecastStartIndex !== -1 ? formattedData[forecastStartIndex].date : null;
  const hasForecast = forecastStartIndex !== -1;

  // 1. WoW Delta calculations
  const historicalPoints = formattedData.filter(d => !d.isForecast);
  let wowPercent = 0;
  let isPriceUp = false;
  if (historicalPoints.length >= 2) {
    const latest = historicalPoints[historicalPoints.length - 1].price;
    // Walk back 7 entries if daily, or fallback to the previous point
    const prevIndex = Math.max(0, historicalPoints.length - 8);
    const previous = historicalPoints[prevIndex].price;
    const diff = latest - previous;
    wowPercent = previous > 0 ? (diff / previous) * 100 : 0;
    isPriceUp = diff > 0;
  }

  // 2. Volatility level computation (based on standard deviation/spread in window)
  let volatility: "Low" | "Medium" | "High" = "Low";
  let spreadPercentage = 0;
  if (historicalPoints.length >= 2) {
    const prices = historicalPoints.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    spreadPercentage = avgPrice > 0 ? ((maxPrice - minPrice) / avgPrice) * 100 : 0;
    
    if (spreadPercentage > 25) {
      volatility = "High";
    } else if (spreadPercentage > 10) {
      volatility = "Medium";
    } else {
      volatility = "Low";
    }
  }

  // 3. Predicted Inflation over next 4 weeks
  const forecastPoints = formattedData.filter(d => d.isForecast);
  let predictedInflation = 0;
  let isInflationUp = false;
  if (historicalPoints.length > 0 && forecastPoints.length > 0) {
    const lastHistPrice = historicalPoints[historicalPoints.length - 1].price;
    const lastFcPrice = forecastPoints[forecastPoints.length - 1].price;
    const diff = lastFcPrice - lastHistPrice;
    predictedInflation = lastHistPrice > 0 ? (diff / lastHistPrice) * 100 : 0;
    isInflationUp = diff > 0;
  }

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isForecast = data.isForecast;
      const price = data.price;
      
      return (
        <div className="bg-white dark:bg-[#151922] border border-[#e5e7eb] dark:border-[#2a3140] rounded-xl p-4 shadow-xl text-xs space-y-2 max-w-[240px] pointer-events-none">
          <div className="flex justify-between items-center border-b border-border/50 pb-1.5 mb-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.displayDate}</span>
            {isForecast ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold text-[10px] scale-90 border border-amber-200/30">
                <Sparkles className="w-2.5 h-2.5" /> ML Forecast
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold text-[10px] scale-90 border border-blue-200/30">
                Observed
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-baseline gap-4">
              <span className="text-slate-500 font-semibold">Average Price:</span>
              <span className="text-sm font-extrabold text-slate-950 dark:text-white">
                {price.toFixed(2)} ETB
              </span>
            </div>
            
            {isForecast && data.confidenceLow !== undefined && data.confidenceHigh !== undefined && (
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>95% Confidence:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {data.confidenceLow.toFixed(1)} - {data.confidenceHigh.toFixed(1)} ETB
                </span>
              </div>
            )}
            
            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
              <span>Source:</span>
              <span className="font-semibold text-slate-500">
                {isForecast ? "SARIMA Model" : "Crowdsourced averages"}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Price History & Forecast</h2>
          <p className="text-sm font-semibold text-muted-foreground">Historical crowdsourcing trends & machine learning forecasts</p>
        </div>
        <ChartTimeRange />
      </div>

      {/* Derived Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* WoW Delta Card */}
        <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-border/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-muted-foreground">Week-over-Week Change</p>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-md font-black tracking-tight",
                wowPercent === 0 ? "text-slate-700 dark:text-slate-300" : isPriceUp ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
              )}>
                {wowPercent === 0 ? "0.0%" : `${isPriceUp ? "+" : ""}${wowPercent.toFixed(1)}%`}
              </span>
              {wowPercent !== 0 && (
                isPriceUp ? <TrendingUp className="w-4 h-4 text-red-500" /> : <TrendingDown className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
          <div className={cn(
            "p-3 rounded-xl shadow-sm border",
            wowPercent === 0 ? "bg-slate-100 border-slate-200 text-slate-500" : isPriceUp ? "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400" : "bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400"
          )}>
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Volatility Indicator Card */}
        <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-border/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-muted-foreground">Historical Volatility</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-md font-black tracking-tight",
                volatility === "High" ? "text-red-600 dark:text-red-400" : volatility === "Medium" ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"
              )}>
                {volatility} Volatility
              </span>
              <span className="text-[10px] font-bold text-muted-foreground px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                {spreadPercentage.toFixed(0)}% spread
              </span>
            </div>
          </div>
          <div className={cn(
            "p-3 rounded-xl shadow-sm border text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30"
          )}>
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* ML Predicted Inflation Card */}
        <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-border/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-muted-foreground">Projected 4-Week Delta</p>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-md font-black tracking-tight",
                predictedInflation === 0 ? "text-slate-700 dark:text-slate-300" : isInflationUp ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
              )}>
                {predictedInflation === 0 ? "Stable expected" : `${isInflationUp ? "+" : ""}${predictedInflation.toFixed(1)}% expected`}
              </span>
            </div>
          </div>
          <div className={cn(
            "p-3 rounded-xl shadow-sm border bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400"
          )}>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Chart Wrapper Container */}
      <div className="h-[360px] w-full border rounded-3xl p-4 sm:p-6 bg-card relative shadow-inner">
        {!hasData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-3xl text-center p-6 space-y-2">
            <Info className="w-10 h-10 text-muted-foreground/40" />
            <h4 className="font-bold text-foreground">Not enough data yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              We require at least one approved historical price submission in this selected window to display time-series graphs.
            </p>
            <button 
              onClick={() => window.location.href = "/market/submit"}
              className="text-xs font-bold text-blue-600 hover:underline hover:text-blue-700"
            >
              Be the first to submit a price &rarr;
            </button>
          </div>
        ) : null}

        {/* Fallback offline message for forecast */}
        {!hasForecast && hasData && (
          <div className="absolute top-2 right-2 z-10 bg-slate-50/90 dark:bg-slate-900/90 border rounded-xl px-3 py-1.5 flex items-center gap-2 text-[10px] text-muted-foreground font-semibold shadow-sm">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>ML forecast temporarily offline due to seasonal data sparsity.</span>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e28743" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#e28743" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
              tickMargin={10}
              axisLine={false}
              tickLine={false}
              minTickGap={25}
            />
            <YAxis 
              tickFormatter={(value) => `${value.toFixed(0)}`} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              width={60}
            />
            <Tooltip
              content={<CustomTooltip />}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingTop: 0, paddingBottom: 20, fontSize: 11, fontWeight: 700 }}
              formatter={(value) => <span className="text-slate-600 dark:text-slate-400">{value}</span>}
            />

            {/* Confidence Band (Area representation) */}
            <Area
              type="monotone"
              dataKey={(d) => d.isForecast || d.isLastHistorical ? d.confidenceHigh : null}
              stroke="none"
              fill="#e28743"
              fillOpacity={0.12}
              name="Forecast Confidence (95% CI)"
              connectNulls
              activeDot={false}
            />
            
            <Area
              type="monotone"
              dataKey={(d) => d.isForecast || d.isLastHistorical ? d.confidenceLow : null}
              stroke="none"
              fill="#ffffff"
              fillOpacity={0}
              name="Confidence Lower"
              connectNulls
              activeDot={false}
            />

            {/* Observed Price Line */}
            <Area
              type="monotone"
              dataKey={(d) => d.isForecast ? null : d.price}
              name="Observed Price"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPrice)"
              activeDot={{ r: 5, strokeWidth: 1 }}
              connectNulls
            />

            {/* Forecast Line */}
            <Area
              type="monotone"
              dataKey={(d) => d.isForecast || d.isLastHistorical ? d.price : null}
              name="ML Forecast"
              stroke="#e28743"
              strokeWidth={3}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorForecast)"
              connectNulls
              activeDot={{ r: 5, strokeWidth: 1 }}
            />

            {/* National Average Line */}
            {history.nationalAverageDataPoints && history.nationalAverageDataPoints.length > 0 && (
              <Area
                type="monotone"
                dataKey={(d) => d.isForecast ? null : d.price}
                data={history.nationalAverageDataPoints}
                name="National Average"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                activeDot={false}
              />
            )}

            {/* Current Price Reference Line */}
            {forecastDate && (
              <ReferenceLine 
                x={formattedData.find(d => d.date === forecastDate)?.displayDate} 
                stroke="#94a3b8" 
                strokeDasharray="3 3"
                label={{ 
                  position: 'top', 
                  value: `Today: ${currentPrice.toFixed(0)} ETB`, 
                  fill: '#2563eb', 
                  fontSize: 10, 
                  fontWeight: 'bold'
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
