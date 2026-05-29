import React from "react";
import Image from "next/image";
import { 
  Bell, 
  LayoutDashboard, 
  Building2, 
  Store, 
  Settings, 
  Search, 
  HelpCircle, 
  Plus, 
  CheckCheck,
  AlertTriangle,
  TrendingDown,
  PieChart,
  Info,
  ChevronRight,
  ChevronDown,
  Eye,
  ArrowDownRight,
  ArrowUpRight,
  Menu
} from "lucide-react";

// Shadcn Imports from your monorepo structure
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Badge } from "@repo/ui/components/badge";
import { Progress } from "@repo/ui/components/progress";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Card, CardContent } from "@repo/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";

export default function NotificationsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] font-sans text-slate-900 dark:text-white">
      
      {/* --- Sidebar --- */}


      {/* --- Main Content --- */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
            
            {/* Feed Column */}
            <div className="flex-1 min-w-0">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                  <p className="mt-1 text-slate-500">Stay updated on your budget and local prices.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <CheckCheck size={18} />
                  Mark all as read
                </Button>
              </div>

              <Tabs defaultValue="all" className="mb-6">
                <TabsList className="h-auto bg-transparent p-0 gap-6 border-b border-slate-200 dark:border-slate-700 w-full justify-start rounded-none">
                  <TabsTrigger value="all" className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-1 py-3 bg-transparent">
                    All Notifications <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">8</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="budget" className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-1 py-3 bg-transparent">
                    Budget Alerts <Badge variant="secondary" className="ml-2">2</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="prices" className="border-b-2 border-transparent rounded-none px-1 py-3 bg-transparent">Price Drops</TabsTrigger>
                  <TabsTrigger value="system" className="border-b-2 border-transparent rounded-none px-1 py-3 bg-transparent">System</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">Today</h3>
                
                <NotificationCard 
                  unread
                  icon={<AlertTriangle className="text-red-600" />}
                  iconBg="bg-red-50 dark:bg-red-900/20"
                  title="Budget Warning: Grocery"
                  time="2 hours ago"
                  description={
                    <>You have exceeded <span className="font-semibold text-slate-900 dark:text-white">85%</span> of your monthly Grocery budget. Current spend: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs font-bold">ETB 4,200</code>.</>
                  }
                  action={<Button variant="outline" size="sm">View Budget</Button>}
                />

                <NotificationCard 
                  unread
                  icon={<TrendingDown className="text-green-600" />}
                  iconBg="bg-green-50 dark:bg-green-900/20"
                  title="Price Drop Alert"
                  time="5 hours ago"
                  description={
                    <>Teff prices have dropped by <span className="text-green-600 font-bold">15%</span> at Merkato Central. Now ETB 115/kg.</>
                  }
                  action={<Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 border-none">See Deal</Button>}
                />

                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-6 pl-1">Yesterday</h3>
                
                <NotificationCard 
                  icon={<PieChart className="text-slate-500" />}
                  iconBg="bg-slate-100 dark:bg-slate-700"
                  title="Weekly Spending Report"
                  time="Yesterday at 9:00 AM"
                  description="Your spending summary for Oct 20 - Oct 26 is ready. You saved ETB 450 compared to last week."
                  read
                />

                <NotificationCard 
                  icon={<Info className="text-blue-500" />}
                  iconBg="bg-blue-50 dark:bg-blue-900/10"
                  title="App Update: Version 2.4"
                  time="Yesterday at 8:15 AM"
                  description="We've improved the price tracking algorithm for more accurate local market data."
                  read
                />
              </div>

              <div className="py-8 flex justify-center">
                <Button variant="ghost" className="text-slate-500 gap-2">
                  Load older notifications <ChevronDown size={16} />
                </Button>
              </div>
            </div>

            {/* Widgets Column */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
              {/* Quick Budget */}
              <Card className="sticky top-6 border-slate-200 dark:border-slate-800">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wide">Quick Budget</h3>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary">Full Details</Button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Total Spent (Oct)</p>
                        <p className="text-2xl font-bold mt-1">ETB 12,400</p>
                      </div>
                      <p className="text-xs font-semibold text-slate-400">Limit: 15,000</p>
                    </div>
                    <div className="space-y-2">
                      <Progress value={82} className="h-2.5" />
                      <p className="text-center text-xs text-slate-500">82% of monthly budget used</p>
                    </div>
                    <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
                      <BudgetRow label="Grocery" percent={85} color="bg-red-500" />
                      <BudgetRow label="Transport" percent={45} color="bg-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Watch */}
              <Card className="bg-primary/5 border-primary/10 dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wide">Price Watch</h3>
                    <Eye size={18} className="text-slate-400" />
                  </div>
                  <div className="space-y-3">
                    <PriceWatchItem name="Red Onions" location="Addis Ababa" price="65" trend="down" change="2%" />
                    <PriceWatchItem name="Cooking Oil" location="5 Liters" price="980" trend="up" change="5%" />
                  </div>
                  <Button variant="ghost" className="mt-4 w-full text-xs font-bold uppercase text-primary">
                    Manage Watchlist
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

{/* --- Helper Components --- */}

function SidebarItem({ icon, label, active = false, badge }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
      active ? "bg-primary/10 text-primary" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
    }`}>
      {icon}
      <p className="text-sm font-medium">{label}</p>
      {badge && (
        <Badge className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5">{badge}</Badge>
      )}
    </div>
  );
}

function NotificationCard({ 
  unread, icon, iconBg, title, time, description, action, read 
}: { 
  unread?: boolean, icon: React.ReactNode, iconBg: string, title: string, time: string, description: React.ReactNode, action?: React.ReactNode, read?: boolean 
}) {
  return (
    <div className={`group relative flex flex-col sm:flex-row gap-4 p-5 rounded-xl border transition-all cursor-pointer ${
      read ? "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 opacity-90 hover:opacity-100 hover:bg-white dark:hover:bg-slate-800" 
           : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
    }`}>
      {unread && <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-r-full" />}
      
      <div className="flex items-start gap-4 flex-1">
        <div className={`size-12 rounded-full flex items-center justify-center shrink-0 border border-black/5 ${iconBg}`}>
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className={`text-base font-semibold ${read ? "text-slate-700 dark:text-slate-200" : "text-slate-900 dark:text-white"}`}>{title}</p>
            {unread && <span className="size-2 rounded-full bg-primary" />}
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{description}</p>
          <p className="text-slate-400 text-xs mt-1 font-medium">{time}</p>
        </div>
      </div>

      <div className="flex items-center sm:self-center pt-2 sm:pt-0 pl-16 sm:pl-0">
        {action ? action : <ChevronRight className="text-slate-300 dark:text-slate-600" />}
      </div>
    </div>
  );
}

function BudgetRow({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-2">
        <div className={`size-2 rounded-full ${color}`} />
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
      </div>
      <span className={`font-medium ${percent > 80 ? "text-red-500" : "dark:text-white"}`}>{percent}%</span>
    </div>
  );
}

function PriceWatchItem({ name, location, price, trend, change }: { name: string, location: string, price: string, trend: 'up' | 'down', change: string }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
      <div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-slate-500">{location}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">ETB {price}</p>
        <p className={`text-xs flex items-center justify-end font-medium ${trend === 'up' ? 'text-red-500' : 'text-green-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
          {change}
        </p>
      </div>
    </div>
  );
}