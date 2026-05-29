"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Star, 
  ChevronRight, 
  Send, 
  Trash2, 
  Camera, 
  Receipt, 
  CheckCircle, 
  AlertCircle,
} from "lucide-react";

import { createReview } from "@/actions/ecommerce";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Textarea } from "@repo/ui/components/textarea";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Badge } from "@repo/ui/components/badge";
import { Progress } from "@repo/ui/components/progress";

const QUICK_TAGS = [
  "Fast Delivery", "Quality Products", "Customer Service", 
  "Fair Pricing", "Easy Returns", "Secure Packaging"
];

function SubmitReviewContent() {
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendorId") ?? "";
  const vendorName = searchParams.get("vendorName") ?? "Bole Electronics Hub";
  const [rating, setRating] = useState(4);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Fast Delivery", "Fair Pricing"]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitReview = () => {
    if (!vendorId) {
      setError("Missing vendor identifier in the review link.");
      return;
    }

    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await createReview({
          vendor_id: vendorId,
          rating,
          comment,
        });
        setSuccess("Review submitted successfully.");
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Unable to submit review.");
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span className="hover:text-primary cursor-pointer transition-colors">Transactions</span>
        <ChevronRight size={14} />
        <span className="hover:text-primary cursor-pointer transition-colors">{vendorName}</span>
        <ChevronRight size={14} />
        <span className="text-foreground">Write a Review</span>
      </nav>

      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight">Share Your Experience</h2>
        <p className="text-muted-foreground max-w-2xl">
          Your feedback helps the community make better decisions. Tell us about your purchase at 
          <span className="font-bold text-foreground"> {vendorName}</span>.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Review Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-8">
              
              {/* Star Rating Selector */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        size={40} 
                        fill={star <= rating ? "#fbbf24" : "transparent"} 
                        className={star <= rating ? "text-amber-400" : "text-slate-200"}
                      />
                    </button>
                  ))}
                  <span className="ml-4 text-xl font-black">{rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Review</label>
                  <span className="text-[10px] font-bold text-muted-foreground">Min. 20 characters</span>
                </div>
                <Textarea 
                  placeholder="Describe the quality of items and the service..." 
                  className="min-h-40 rounded-2xl border-none p-4"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </div>

              {/* Tags Selector */}
              <div className="space-y-4">
                
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">What stood out?</label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map((tag) => (
                    <Badge 
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "secondary"}
                      className={`px-4 py-2 rounded-full cursor-pointer transition-all border-none font-bold text-[10px] uppercase
                        ${selectedTags.includes(tag) ? "bg-primary text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Media Upload Mock */}
              <div className="space-y-4">
               
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Add Photos (Optional)</label>
                <div className="grid grid-cols-4 gap-4">
                  <button className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all bg-slate-50/50">
                    <Camera size={24} />
                    <span className="text-[10px] font-black mt-2">UPLOAD</span>
                  </button>
                  <div className="aspect-square rounded-2xl bg-slate-100 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <Trash2 size={20} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Logic */}
              <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox id="anon" />
                  <label htmlFor="anon" className="text-sm font-bold text-slate-500 cursor-pointer">Post anonymously</label>
                </div>
                <Button
                  className="h-12 px-8 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  onClick={submitReview}
                  disabled={isPending || !vendorId}
                >
                  Submit Review <Send size={16} />
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
          <Card className="bg-slate-50 border-none rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Receipt size={16} className="text-primary" /> Transaction Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400">Vendor</span>
                <span className="text-xs font-black">{vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400">Date</span>
                <span className="text-xs font-black">Oct 24, 2023</span>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-black text-slate-600">Total</span>
                <span className="text-xl font-black text-primary">ETB 14,250.00</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full" />
             <h4 className="text-sm font-black mb-4">Vendor Trust</h4>
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-primary">
                  <span>Community Score</span>
                  <span>94%</span>
                </div>
                <Progress value={94} className="h-1.5" />
                <p className="text-[11px] text-slate-500 italic mt-4 font-medium">
                  "98% of users recommended this vendor in the last 30 days."
                </p>
             </div>
          </Card>

          <div className="bg-orange-50 rounded-2xl p-6 space-y-4 border border-orange-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-700">Guidelines</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[11px] font-bold text-orange-800">
                <CheckCircle size={14} className="mt-0.5 text-orange-600" />
                Be specific about service quality.
              </li>
              <li className="flex items-start gap-2 text-[11px] font-bold text-orange-800">
                <AlertCircle size={14} className="mt-0.5 text-orange-600" />
                Avoid personal attacks.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubmitReview() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SubmitReviewContent />
    </Suspense>
  );
}