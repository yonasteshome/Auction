"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  ChevronRight, 
  Star, 
  TrendingDown, 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  Download,
  Cpu,
  Monitor,
  Zap,
  Battery,
  Layers
} from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { getProductById } from "@/actions/ecommerce";
import type { Recommendation } from "@/lib/ecommerce-types";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [selectedFinish, setSelectedFinish] = useState("charcoal");
  const [product, setProduct] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      if (!params?.id) {
        setLoading(false);
        setError("Missing product identifier.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getProductById(params.id);
        if (!active) {
          return;
        }

        setProduct(response);
      } catch {
        if (active) {
          setError("Unable to load product details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [params?.id]);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-8 text-sm text-muted-foreground">Loading product details...</div>;
  }

  if (error || !product) {
    return <div className="max-w-7xl mx-auto p-8 text-sm text-destructive">{error ?? "Unable to load product details."}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <a href="#" className="hover:text-primary transition-colors">Market</a>
        <ChevronRight size={14} />
        <a href="#" className="hover:text-primary transition-colors">Electronics</a>
        <ChevronRight size={14} />
        <span className="text-foreground">{product.item_name}</span>
      </nav>

      <div className="grid grid-cols-12 gap-12">
        
        {/* Left: Product Visuals */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <div className="relative aspect-4/3 rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-sm border border-muted/50 group">
            <Badge className="absolute top-8 left-8 z-10 bg-primary text-white font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
              New Arrival
            </Badge>
            <div className="absolute inset-0 bg-[url('/laptop-hero.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-1000" />
            
            {/* Thumbnail Strip */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 p-2 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20">
              {[1, 2, 3].map((i) => (
                <button key={i} className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${i === 1 ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                   <div className="w-full h-full bg-slate-300 dark:bg-slate-800" />
                </button>
              ))}
            </div>
          </div>

          {/* Feature Highlights Bento */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="rounded-3xl border-none bg-white dark:bg-slate-900 p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Cpu size={24} /></div>
                <h3 className="font-black text-lg">Peak Performance</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Engineered with the latest M3X architecture for demanding financial modeling and high-speed data analysis.
              </p>
            </Card>
            <Card className="rounded-3xl border-none bg-white dark:bg-slate-900 p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Battery size={24} /></div>
                <h3 className="font-black text-lg">Extended Battery</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Stay productive for up to 22 hours on a single charge, perfect for cross-continental travel and field work.
              </p>
            </Card>
          </div>
        </div>

        {/* Right: Configuration & Purchase */}
        <div className="col-span-12 lg:col-span-5 space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter leading-[1.1]">
              {product.item_name} <br />
              <span className="text-primary italic">Master Edition</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4].map((s) => <Star key={s} size={18} fill="currentColor" />)}
                <Star size={18} className="opacity-50" />
              </div>
              <span className="text-sm font-bold text-muted-foreground">({product.rating_count} Reviews)</span>
            </div>
          </div>

          <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-primary tracking-tight">ETB {Number(product.price).toFixed(2)}</span>
              <span className="text-lg text-muted-foreground line-through font-medium opacity-50">{product.city ?? "Market price"}</span>
            </div>
            <p className="text-xs font-black text-primary flex items-center gap-2 uppercase tracking-widest">
              <TrendingDown size={14} /> {product.percent_vs_market_avg != null ? `${Math.abs(product.percent_vs_market_avg)}% vs market avg` : "Market price data available"}
            </p>
            <div className="pt-4 space-y-3">
              {product.variant ? (
                <Badge className="rounded-full bg-white text-slate-900 font-black border-none">
                  Variant: {product.variant}
                </Badge>
              ) : null}
              {product.description ? (
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {product.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-8">
            {/* Finish Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Select Finish</label>
              <div className="flex gap-4">
                {['#1e293b', '#cbd5e1', '#135bec'].map((color) => (
                  <button 
                    key={color}
                    className={`w-12 h-12 rounded-full ring-offset-4 ring-offset-background transition-all ${selectedFinish === color ? 'ring-4 ring-primary' : 'ring-1 ring-muted'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedFinish(color)}
                  />
                ))}
              </div>
            </div>

            {/* Storage Options */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Memory & Storage</label>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="h-20 justify-between px-6 rounded-2xl border-2 border-primary bg-primary/5 hover:bg-primary/10">
                  <div className="text-left">
                    <p className="font-black">{product.unit} configuration</p>
                    <p className="text-[10px] font-bold text-primary/70 uppercase">Vendor: {product.shop_name}</p>
                    {product.variant ? (
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Variant: {product.variant}</p>
                    ) : null}
                  </div>
                  <Badge className="bg-primary text-white">Selected</Badge>
                </Button>
                <Button variant="outline" className="h-20 justify-between px-6 rounded-2xl border-muted hover:border-primary/50 transition-all">
                  <div className="text-left">
                    <p className="font-black">Compare nearby vendors</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{product.distance_km != null ? `${product.distance_km} km away` : "Distance unavailable"}</p>
                  </div>
                </Button>
              </div>
              {product.description ? (
                <p className="rounded-2xl border border-muted/60 bg-white/70 p-4 text-sm leading-relaxed text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
                  {product.description}
                </p>
              ) : null}
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-6 pt-4">
            <div className="flex gap-4">
              <Button className="flex-4 h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/20 gap-3">
                <ShoppingBag size={22} /> Add to Order
              </Button>
              <Button variant="outline" className="h-16 w-16 rounded-2xl border-muted hover:bg-slate-50">
                <Heart size={22} />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs font-bold text-muted-foreground">
              <ShieldCheck size={16} className="text-green-600" />
              Free Insured Shipping to Addis Ababa & Regional Hubs
            </div>
          </div>
        </div>
      </div>

      {/* Tech Specs Section */}
      <section className="pt-20 border-t border-muted/50">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black tracking-tight">Technical Specifications</h2>
          <Button variant="ghost" className="text-primary font-black gap-2 hover:bg-transparent p-0">
            Download Datasheet <Download size={18} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-muted/50 rounded-[2.5rem] overflow-hidden border border-muted/50">
          {[
            { icon: <Zap />, title: "Computation", specs: [["Processor", "M3X 12-Core"], ["GPU", "30-Core Engine"]] },
            { icon: <Monitor />, title: "Visuals", specs: [["Display", "16.2\" Liquid Pro"], ["Refresh", "120Hz ProMotion"]] },
            { icon: <Layers />, title: "Connectivity", specs: [["Ports", "3x Thunderbolt 4"], ["Wireless", "Wi-Fi 7 / BT 5.4"]] }
          ].map((group, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="text-primary">{group.icon}</div>
                <h4 className="font-black uppercase tracking-widest text-sm">{group.title}</h4>
              </div>
              <div className="space-y-4">
                {group.specs.map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="font-black text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}