"use client";

import React from "react";
import { 
  Store, 
  Search, 
  ArrowRight, 
  ShoppingCart, 
  BadgeCheck, 
  Star, 
  Cpu, 
  Utensils, 
  Factory, 
  Stethoscope, 
  HardHat,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";

export default function MarketplacePage() {
  const categories = [
    { name: "Electronics", icon: <Cpu size={18} /> },
    { name: "Groceries", icon: <Utensils size={18} /> },
    { name: "Industrial", icon: <Factory size={18} /> },
    { name: "Healthcare", icon: <Stethoscope size={18} /> },
    { name: "Construction", icon: <HardHat size={18} /> },
  ];

  return (
    <div className="max-w-400 mx-auto p-8 space-y-12">
      
      
      {/* Hero Bento Section */}
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 relative rounded-[2.5rem] overflow-hidden bg-primary min-h-110 flex flex-col justify-end p-12 text-white shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-[url('/warehouse-bg.jpg')] bg-cover bg-center mix-blend-overlay opacity-30" />
          <div className="relative z-10 space-y-6">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 backdrop-blur-md uppercase tracking-tighter font-bold">
              B2B Marketplace
            </Badge>
            <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
              Sourcing Ethiopia's<br />Finest Commodities.
            </h2>
            <p className="text-lg text-white/80 max-w-lg font-medium">
              Direct access to verified suppliers across the region. Transparent pricing, secure logistics, and export-grade quality.
            </p>
            <div className="flex gap-4 pt-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 rounded-2xl h-14">
                Browse Catalog <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold px-8 rounded-2xl h-14">
                Verify Business
              </Button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6">
          {/* Flash Deal */}
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 flex flex-col justify-between bg-white dark:bg-slate-900">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
                <Zap fill="currentColor" size={28} />
              </div>
              <Badge variant="destructive" className="rounded-full px-3 py-1 text-[10px] font-black uppercase">Ending Soon</Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black">Grade A Coffee</h3>
              <p className="text-muted-foreground text-sm">Special export-grade Sidama beans from local cooperatives.</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-black text-primary">$12.40</span>
                <span className="text-muted-foreground text-xs ml-1 font-bold">/kg</span>
              </div>
              <Button size="icon" className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20">
                <ShoppingCart size={20} />
              </Button>
            </div>
          </Card>

          {/* Loyalty Section */}
          <Card className="rounded-[2.5rem] border-none bg-slate-950 p-8 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">SpendSense Plus</h3>
              <p className="text-slate-400 text-sm">You earned 12,450 points this month.</p>
            </div>
            <div className="space-y-4">
              <Progress value={72} className="h-2 bg-white/10" />
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>72% to Next Tier</span>
                <span className="text-white">Platinum Status</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Categories */}
      <section className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        <Button className="rounded-2xl h-14 px-8 font-bold text-lg gap-3 shadow-xl shadow-primary/20">
          <Store size={20} /> All Categories
        </Button>
        {categories.map((cat) => (
          <Button key={cat.name} variant="outline" className="rounded-2xl h-14 px-8 font-bold text-lg gap-3 border-muted bg-white dark:bg-slate-900 hover:border-primary hover:text-primary transition-all">
            {cat.icon} {cat.name}
          </Button>
        ))}
      </section>

      {/* Verified Vendors */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tight">Verified Vendors</h2>
            <p className="text-muted-foreground font-medium">Top rated suppliers with certified logistics and trade history.</p>
          </div>
          <Button variant="link" className="text-primary font-black text-lg gap-2">
            View All Vendors <ArrowRight size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="group rounded-[2rem] border-muted/50 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white dark:bg-slate-900">
              <div className="h-32 bg-slate-100 dark:bg-slate-800 relative">
                <div className="absolute -bottom-8 left-6 w-20 h-20 bg-white dark:bg-slate-950 rounded-2xl p-1 shadow-xl border dark:border-slate-800">
                  <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center">
                    <Store className="text-primary/20" size={32} />
                  </div>
                </div>
              </div>
              <CardContent className="pt-12 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black group-hover:text-primary transition-colors">Abyssinia Tech</h3>
                    <p className="text-[10px] font-black uppercase text-secondary flex items-center gap-1 mt-1">
                      <BadgeCheck size={12} fill="currentColor" className="text-white" /> Verified Exporter
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> 4.9
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold rounded-lg border-muted">Networking</Badge>
                  <Badge variant="outline" className="text-[10px] font-bold rounded-lg border-muted">IT Hardware</Badge>
                </div>
                <div className="pt-4 border-t border-muted/50 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-bold">Active Deals: <span className="text-foreground">14</span></span>
                  <Button variant="ghost" className="text-primary font-black text-xs uppercase p-0 h-auto hover:bg-transparent">Storefront</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Strategic Deals */}
      <section className="space-y-8">
        <div className="flex items-center gap-6">
          <h2 className="text-4xl font-black tracking-tight whitespace-nowrap">Strategic Deals</h2>
          <div className="h-px bg-muted flex-1" />
          <div className="flex gap-3">
            <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-muted"><ChevronLeft size={20} /></Button>
            <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-muted"><ChevronRight size={20} /></Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Strategic Deal */}
          <Card className="col-span-12 lg:col-span-5 rounded-[3rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <div className="h-72 bg-slate-200 dark:bg-slate-800 relative">
              <Badge className="absolute top-6 left-6 bg-primary text-white font-black px-4 py-2 rounded-xl text-sm">Save 15%</Badge>
            </div>
            <CardContent className="p-10 space-y-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-black leading-tight">Corporate IT Upgrade Bundle</h3>
                <p className="text-muted-foreground font-medium">Dell Latitude series + docking station for bulk corporate procurement.</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground line-through font-bold block">$1,450.00</span>
                  <span className="text-4xl font-black text-foreground">$1,232.50</span>
                </div>
                <Button className="h-16 w-16 rounded-[1.5rem] shadow-xl shadow-primary/20">
                  <Plus size={28} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Small Deals Grid */}
          <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
             {[1, 2, 3].map((i) => (
                <Card key={i} className="rounded-3xl border-muted/50 shadow-none hover:shadow-md transition-shadow bg-white dark:bg-slate-900 overflow-hidden">
                  <div className="flex p-4 gap-5">
                    <div className="w-28 h-28 bg-muted rounded-2xl shrink-0" />
                    <div className="flex flex-col justify-between py-1 flex-1">
                      <div>
                        <h4 className="font-black text-lg leading-tight">Premium Long Grain Rice</h4>
                        <p className="text-xs text-muted-foreground font-bold mt-1">Wholesale pack 50kg x 20</p>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-xl font-black text-primary">$840.00</span>
                        <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/5 rounded-xl"><Plus size={20} /></Button>
                      </div>
                    </div>
                  </div>
                </Card>
             ))}
             <Card className="rounded-3xl border-dashed border-2 border-primary/20 bg-primary/5 flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors">
                <div className="text-center p-6 space-y-2">
                  <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                    <ArrowRight size={24} />
                  </div>
                  <span className="font-black text-primary text-sm uppercase tracking-widest">Discover More</span>
                </div>
             </Card>
          </div>
        </div>
      </section>
    </div>
  );
}