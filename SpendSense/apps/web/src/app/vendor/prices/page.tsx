import React from "react";
import { 
  CircleDollarSign, 
  Search, 
  Bell, 
  Store, 
  ChevronRight, 
  RefreshCw, 
  Download, 
  PencilLine, 
  ChevronDown, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Edit
} from "lucide-react";

// Shadcn & Custom Monorepo Components
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@repo/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";

export default function PriceManagement() {
  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622] font-sans text-[#111318] antialiased">
      
      {/* --- Top Navigation --- */}
      <header className="bg-white dark:bg-[#1a2233] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 text-[#111318] dark:text-white group cursor-pointer">
                <div className="flex items-center justify-center size-8 text-[#135bec] bg-[#135bec]/10 rounded-lg">
                  <CircleDollarSign size={20} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">BudgetEthiopia</h1>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <NavLink label="Dashboard" />
                <NavLink label="Price Management" active />
                <NavLink label="Reports" />
                <NavLink label="Settings" />
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center bg-[#f6f6f8] dark:bg-[#101622] rounded-lg px-3 py-2 w-64 border border-transparent focus-within:border-[#135bec]/50 transition-all">
                <Search size={18} className="text-slate-400" />
                <input className="bg-transparent border-none text-sm w-full focus:ring-0 ml-2 dark:text-white" placeholder="Search..." />
              </div>
              <button className="text-slate-500 hover:text-slate-900 relative">
                <Bell size={22} />
                <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <Avatar className="size-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>AK</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold dark:text-white">Abebe Kebede</p>
                  <p className="text-[10px] text-slate-500">Mercato Vendor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 text-sm text-slate-500">
          <Store size={16} />
          <span>Vendor Dashboard</span>
          <ChevronRight size={14} />
          <span className="font-medium text-[#111318] dark:text-white">Price Management</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black dark:text-white tracking-tight mb-2">Price Management</h2>
            <p className="text-slate-500 max-w-2xl">Update your inventory pricing in real-time to help customers make better budget decisions.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-[#1a2233] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-medium text-slate-500">
              <RefreshCw size={14} className="text-green-500 animate-spin-slow" />
              Synced: Just now
            </div>
            <Button variant="outline" className="gap-2 bg-white dark:bg-[#1a2233]">
              <Download size={18} />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-500 text-xs font-medium uppercase mb-1">Total Items</p>
                <p className="text-2xl font-bold dark:text-white">142</p>
              </Card>
              <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-500 text-xs font-medium uppercase mb-1">Updated Today</p>
                <p className="text-2xl font-bold text-[#135bec]">18</p>
              </Card>
            </div>

            <Card className="shadow-lg border-slate-200 dark:border-slate-800">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <PencilLine className="text-[#135bec]" />
                  Quick Update
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium dark:text-white">Item Name</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <Input className="pl-10 bg-slate-50 dark:bg-[#101622] border-none" placeholder="Search item (e.g. Teff)" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium dark:text-white">Category</label>
                  <Select defaultValue="grains">
                    <SelectTrigger className="bg-slate-50 dark:bg-[#101622] border-none">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grains">Grains & Flours</SelectItem>
                      <SelectItem value="veggies">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium dark:text-white">New Price</label>
                    <div className="relative">
                      <Input type="number" className="bg-slate-50 dark:bg-[#101622] border-none" placeholder="0.00" />
                      <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">ETB</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium dark:text-white">Stock</label>
                    <Select defaultValue="in">
                      <SelectTrigger className="bg-slate-50 dark:bg-[#101622] border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">In Stock</SelectItem>
                        <SelectItem value="low">Low Stock</SelectItem>
                        <SelectItem value="out">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full bg-[#135bec] hover:bg-[#0e4bce] font-bold gap-2 py-6">
                  Update Price
                  <CheckCircle size={18} />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Table */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-slate-200 dark:border-slate-800">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                <Badge className="bg-[#135bec]/10 text-[#135bec] hover:bg-[#135bec]/20 border-[#135bec]/20 px-4 py-1.5 rounded-full">All Items</Badge>
                <FilterButton label="Grains" />
                <FilterButton label="Vegetables" />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                <span>Sort by:</span>
                <span className="font-semibold text-[#111318] dark:text-white cursor-pointer flex items-center gap-1">
                  Last Updated <ChevronDown size={16} />
                </span>
              </div>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-xs font-semibold uppercase">Item Details</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold uppercase">Category</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold uppercase text-right">Price (ETB)</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold uppercase text-center">Trend</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-semibold uppercase">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <InventoryRow 
                    name="Teff (White)" 
                    type="Magna" 
                    cat="Grains" 
                    price="120.00" 
                    oldPrice="115.00" 
                    trend="+4.3%" 
                    trendDir="up" 
                    time="2 mins ago" 
                  />
                  <InventoryRow 
                    name="Red Onions" 
                    type="Local" 
                    cat="Vegetables" 
                    price="60.00" 
                    oldPrice="62.00" 
                    trend="-3.2%" 
                    trendDir="down" 
                    time="1 hour ago" 
                  />
                </TableBody>
              </Table>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm text-slate-500">Showing <span className="font-semibold text-[#111318] dark:text-white">1-5</span> of 142</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

{/* --- Helpers --- */}

function NavLink({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <span className={`text-sm font-medium cursor-pointer transition-colors ${active ? "text-[#135bec]" : "text-slate-500 hover:text-[#135bec]"}`}>
      {label}
    </span>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <Badge variant="outline" className="px-4 py-1.5 rounded-full border-transparent bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 cursor-pointer">
      {label}
    </Badge>
  );
}

function InventoryRow({ name, type, cat, price, oldPrice, trend, trendDir, time }: any) {
  return (
    <TableRow className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <TableCell className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div>
            <p className="font-bold text-sm dark:text-white">{name}</p>
            <p className="text-xs text-slate-500">{type}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-none font-medium">
          {cat}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <p className="text-lg font-bold dark:text-white">{price}</p>
        <p className="text-xs text-slate-400 line-through">{oldPrice}</p>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex flex-col items-center">
          {trendDir === 'up' ? <TrendingUp size={18} className="text-red-500" /> : <TrendingDown size={18} className="text-green-500" />}
          <span className={`text-xs font-semibold ${trendDir === 'up' ? 'text-red-500' : 'text-green-500'}`}>{trend}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#135bec]">
          <Edit size={18} />
        </Button>
      </TableCell>
    </TableRow>
  );
}