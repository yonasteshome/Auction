import React from "react";
import {
  ArrowUpIcon,
  Download,
  ChevronRight,
  Lightbulb,
  Plus,
  TrendingUp,
  Verified,
} from "lucide-react";

import { getOrders, getPurchaseKpiSummary } from "@/actions/ecommerce";
import type { Purchase } from "@/lib/ecommerce-types";
import { OrderDetailButton } from "@/components/ecommerce/order-detail-button";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import { OrderSearch, OrderPagination } from "./OrderControls";

function parseAmount(amount: string | number) {
  if (typeof amount === "number") {
    return amount;
  }

  const parsed = Number(String(amount).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getStatusVariant(status: Purchase["status"]) {
  switch (status) {
    case "delivered":
      return "secondary" as const;
    case "failed":
    case "cancelled":
      return "destructive" as const;
    case "shipped":
      return "default" as const;
    case "paid":
      return "outline" as const;
    case "pending":
    default:
      return "outline" as const;
  }
}

function getStatusLabel(status: Purchase["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function OrderHistoryPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const search = typeof sp.search === "string" ? sp.search : "";

  let orders: Purchase[] = [];
  let pagination = { current_page: 1, total_pages: 1, total_records: 0 };
  let kpi = { total_revenue: 0, pending_orders: 0, average_order_value: 0, top_vendors: [] as any[] };
  let error = null;

  try {
    const [ordersRes, kpiRes] = await Promise.all([
      getOrders({ page, search }),
      getPurchaseKpiSummary()
    ]);
    orders = ordersRes.results || [];
    if (ordersRes.pagination) {
      pagination = ordersRes.pagination;
    }
    kpi = kpiRes || kpi;
  } catch (err: any) {
    error = err.message || "Failed to load order history";
  }

  if (error) {
    return <div className="p-4 md:p-8 max-w-7xl mx-auto text-sm text-destructive">{error}</div>;
  }

  const { total_revenue: totalRevenue, pending_orders: pendingOrders, average_order_value: averageOrderValue, top_vendors: topVendors } = kpi;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
            <span>Shopping</span>
            <ChevronRight size={10} />
            <span className="text-primary">Order History</span>
          </nav>
          <h2 className="text-3xl font-bold tracking-tight">Order History</h2>
          <p className="text-muted-foreground mt-1">Manage and track your procurement across all vendors.</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderSearch />
          {/* <Button variant="outline" className="gap-2">
            <Download size={18} /> Export
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1  gap-6">
        <Card className=" relative overflow-hidden bg-card border-none shadow-sm">
          <div className="absolute -right-4 -top-4 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Monthly Summary</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-4xl font-extrabold">{formatCurrency(totalRevenue)}</h3>
                <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-none gap-1 py-1">
                  <ArrowUpIcon size={14} /> {orders.length > 0 ? "Live" : "0"}
                </Badge>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-8">
              <StatItem label="Total Orders" value={String(orders.length).padStart(2, "0")} />
              <StatItem label="Pending Processing" value={String(pendingOrders).padStart(2, "0")} border />
              <StatItem label="Avg. Order Value" value={formatCurrency(averageOrderValue)} border />
            </div>
          </CardContent>
        </Card>

        {/* <Card className="md:col-span-4 bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20 relative overflow-hidden">
          <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
            <div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Lightbulb size={20} className="text-primary-foreground" /> Smart Tip
              </h4>
              <p className="text-primary-foreground/80 text-sm mt-2 leading-relaxed">
                Your spending on <span className="text-white font-bold">Office Supplies</span> has increased by 20% this month. Consider bulk buying.
              </p>
            </div>
            <Button variant="secondary" className="mt-6 w-full font-bold bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm">
              View Supplier Analysis
            </Button>
            <TrendingUp size={120} className="absolute bottom-0 right-0 opacity-10 translate-y-1/4 translate-x-1/4 pointer-events-none" />
          </CardContent>
        </Card> */}
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card">
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">Recent Transactions</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground">Showing {pagination.total_records} records</span>
          </div>
          <OrderPagination currentPage={pagination.current_page} totalPages={pagination.total_pages} />
        </div>
        <Table>
          <TableHeader className="bg-muted/10 text-xs font-bold uppercase tracking-widest">
            <TableRow>
              <TableHead className="px-6">Order ID</TableHead>
              <TableHead className="px-6">Date</TableHead>
              <TableHead className="px-6">Vendor Name</TableHead>
              <TableHead className="px-6 text-center">Items</TableHead>
              <TableHead className="px-6 text-right">Amount</TableHead>
              <TableHead className="px-6">Status</TableHead>
              <TableHead className="px-6 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                <TableCell className="px-6 font-mono text-sm text-muted-foreground">{order.reference || order.id.slice(0, 8)}</TableCell>
                <TableCell className="px-6 text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                <TableCell className="px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {(order.vendor_name || 'V').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold">{order.vendor_name || 'Unknown Vendor'}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 text-center font-medium text-muted-foreground">{order.quantity}</TableCell>
                <TableCell className="px-6 text-right font-bold">{formatCurrency(parseAmount(order.amount))}</TableCell>
                <TableCell className="px-6">
                  <Badge className="rounded-full px-3 py-0.5 text-[10px] font-bold" variant={getStatusVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 text-center">
                  <OrderDetailButton orderId={order.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InsightsCard title="Top Vendors" action="View All">
          <ul className="space-y-4">
            {topVendors.map((vendor) => (
              <VendorItem key={vendor.name} name={vendor.name} orders={vendor.orders} amount={formatCurrency(vendor.amount)} />
            ))}
          </ul>
        </InsightsCard>

        <InsightsCard title="Spend Distribution">
          <div className="space-y-5 mt-2">
            <DistributionItem label="Utilities" percentage={42} color="bg-primary" />
            <DistributionItem label="Supplies" percentage={28} color="bg-secondary" />
            <DistributionItem label="Logistics" percentage={30} color="bg-tertiary" />
          </div>
        </InsightsCard>

        <Card className="bg-slate-950 text-white border-none shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6 text-primary">
              <Verified size={28} />
              <h5 className="font-bold text-lg text-white">Vendor Audit</h5>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Your annual supplier audit is due in <span className="text-white font-bold">14 days</span>. Ensure all VAT registrations are current.
            </p>
            <Button className="w-full font-bold h-11 bg-primary hover:opacity-90 transition-opacity">
              Start Audit Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* <Button
        size="icon"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Plus size={32} />
      </Button> */}
    </div>
  );
}

// Mini Components
function StatItem({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={`${border ? "border-l border-border pl-8" : ""}`}>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function InsightsCard({ title, children, action }: { title: string; children: React.ReactNode; action?: string }) {
  return (
    <Card className="border-none shadow-sm bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        {action && <Button variant="link" className="h-auto p-0 text-primary text-xs font-bold">{action}</Button>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function VendorItem({ name, orders, amount }: { name: string; orders: number; amount: string }) {
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs uppercase">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="text-xs text-muted-foreground">{orders} orders</p>
        </div>
      </div>
      <span className="text-sm font-bold">{amount}</span>
    </li>
  );
}

function DistributionItem({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
        <span className="text-muted-foreground">{label}</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} className={`h-2 ${color}`} />
    </div>
  );
}