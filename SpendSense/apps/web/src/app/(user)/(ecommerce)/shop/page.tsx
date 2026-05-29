"use client";

import React from "react";
import { 
  Verified, 
  Star, 
  MapPin, 
  Search, 
  Filter, 
  ArrowRight,
  Computer,
  Shirt,
  Construction,
  Truck,
  Printer,
  Armchair,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Rocket
} from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";

const VENDORS = [
  { id: 1, name: "Abyssinia Tech Solutions", loc: "Addis Ababa, Bole", rating: 4.9, tin: "0045612349", cat: "IT Hardware", icon: <Computer /> },
  { id: 2, name: "Selam Textile Mfg.", loc: "Hawassa Ind. Park", rating: 4.7, tin: "0098223101", cat: "Apparel", icon: <Shirt /> },
  { id: 3, name: "Unity Engineering Co.", loc: "Adama, East Zone", rating: 4.8, tin: "0011228843", cat: "Construction", icon: <Construction /> },
  { id: 4, name: "Nile General Trading", loc: "Dire Dawa", rating: 4.6, tin: "0029384756", cat: "Wholesale", icon: <Truck /> },
  { id: 5, name: "Alpha Printing Press", loc: "Addis Ababa, Arada", rating: 4.9, tin: "0077665544", cat: "Services", icon: <Printer /> },
  { id: 6, name: "Ethio Decor", loc: "Bahir Dar", rating: 4.5, tin: "0055443322", cat: "Furnishing", icon: <Armchair /> },
];

export default function VendorDirectory() {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <span>Market</span>
            <ChevronRight size={12} />
            <span>Verified Vendors</span>
          </nav>
          <h2 className="text-4xl font-black tracking-tighter">Vendor Directory</h2>
          <p className="text-muted-foreground font-medium">Manage relationships with 450+ verified local suppliers.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-bold gap-2">
            <Filter size={16} /> Filters
          </Button>
          <Button variant="outline" className="rounded-xl font-bold gap-2">
            Sort by Rating
          </Button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Verified Total", val: "458 Vendors", trend: "+12%", icon: <Verified className="text-primary" /> },
          { label: "Average Rating", val: "4.8 / 5.0", trend: null, icon: <Star className="text-tertiary" /> },
          { label: "Transacted Volume", val: "ETB 1.2M", trend: null, icon: <TrendingUp className="text-primary" /> }
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">{stat.icon}</div>
              {stat.trend && <Badge className="bg-green-50 text-green-700 border-none font-bold">{stat.trend}</Badge>}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-black mt-1">{stat.val}</h3>
          </Card>
        ))}
        
        <Card className="rounded-2xl bg-primary text-white p-6 shadow-xl relative overflow-hidden group">
          <Rocket className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Premium Program</p>
          <h3 className="text-lg font-bold leading-tight mb-4">Unlock preferred vendor rates</h3>
          <Button className="w-full bg-white text-primary hover:bg-blue-50 font-black rounded-xl">Upgrade</Button>
        </Card>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {VENDORS.map((vendor) => (
          <Card key={vendor.id} className="rounded-3xl overflow-hidden border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-40 bg-slate-100 relative">
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-xs font-black">
                <Star size={12} fill="#f59e0b" className="text-amber-500" /> {vendor.rating}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{vendor.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                    <MapPin size={14} /> {vendor.loc}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl text-primary border border-slate-100">{vendor.icon}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">TIN Number</p>
                  <p className="text-xs font-mono font-bold tracking-tighter">{vendor.tin}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Category</p>
                  <p className="text-xs font-bold">{vendor.cat}</p>
                </div>
              </div>

              <Button className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-primary text-foreground hover:text-white font-black transition-all gap-2 border-none">
                View Details <ArrowRight size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 pt-8">
        <Button variant="outline" size="icon" className="rounded-xl"><ChevronLeft size={20}/></Button>
        <Button className="rounded-xl font-black px-5">1</Button>
        <Button variant="ghost" className="rounded-xl font-bold">2</Button>
        <Button variant="ghost" className="rounded-xl font-bold">3</Button>
        <span className="px-2 text-muted-foreground font-bold">...</span>
        <Button variant="ghost" className="rounded-xl font-bold">12</Button>
        <Button variant="outline" size="icon" className="rounded-xl"><ChevronRight size={20}/></Button>
      </div>
    </div>
  );
}