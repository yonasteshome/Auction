"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Pencil, Clock, CheckCircle2, Trash2, Loader2, MessageSquarePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { toast } from "sonner";
import RatingDistribution from "./RatingDistribution";
import { VendorReviewListResponse, VendorReviewResponse } from "@/types/api/vendor-details";
import { submitVendorReview, updateVendorReview, deleteVendorReview } from "@/actions/reviews";

interface ReviewSectionClientProps {
  vendorId: string;
  initialReviews: VendorReviewListResponse;
}

export default function ReviewSectionClient({
  vendorId,
  initialReviews,
}: ReviewSectionClientProps) {
  const router = useRouter();
  const [reviewsData, setReviewsData] = useState<VendorReviewListResponse>(initialReviews);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  // Sync state when initialReviews updates
  useEffect(() => {
    setReviewsData(initialReviews);
  }, [initialReviews]);

  const eligibility = reviewsData.eligibility;
  const verifiedDetails = reviewsData.verifiedPurchaseDetails;
  const userReview = reviewsData.userReview;

  // Countdown timer for 24-hour grace window
  const [timeLeft, setTimeLeft] = useState<number>(userReview?.expiresInSeconds || 0);
  useEffect(() => {
    if (!userReview || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-trigger read-only state update by setting canEdit to false
          setReviewsData(prevData => {
            if (prevData.userReview) {
              return {
                ...prevData,
                userReview: {
                  ...prevData.userReview,
                  canEdit: false
                }
              };
            }
            return prevData;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [userReview, timeLeft]);

  const formatTimeLeft = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const handleOpenReviewModal = () => {
    if (eligibility === "already_reviewed" && userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment);
    } else {
      setRating(0);
      setComment("");
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    startTransition(async () => {
      const isEditing = eligibility === "already_reviewed" && userReview;
      const res = isEditing
        ? await updateVendorReview(vendorId, userReview.id, { rating, comment })
        : await submitVendorReview(vendorId, { rating, comment });

      if (res.success) {
        toast.success(isEditing ? "Review updated successfully" : "Review submitted successfully!");
        setOpen(false);
        // Soft reload/re-fetch reviews by triggering next.js cache refresh
        // Optimistic UI updates
        const newReviewObj: VendorReviewResponse = {
          id: res.data.id || String(Date.now()),
          userName: res.data.userName || "Your Review",
          userInitial: "Y",
          rating,
          comment,
          date: new Date().toISOString(),
          helpfulCount: 0,
          verifiedPurchase: true,
        };

        setReviewsData((prev) => {
          let updatedReviews = [...prev.reviews];
          if (isEditing) {
            updatedReviews = updatedReviews.map((r) => r.id === userReview.id ? newReviewObj : r);
          } else {
            updatedReviews.unshift(newReviewObj);
          }

          // Calculate new average and total
          const total = updatedReviews.length;
          const avg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / total;

          // Re-calculate distribution
          const dist = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
          updatedReviews.forEach(r => {
            const key = String(r.rating) as keyof typeof dist;
            if (key in dist) dist[key]++;
          });

          return {
            ...prev,
            reviews: updatedReviews,
            averageRating: parseFloat(avg.toFixed(1)),
            totalReviews: total,
            distribution: dist,
            eligibility: "already_reviewed",
            userReview: {
              id: res.data.id || String(Date.now()),
              rating,
              comment,
              createdAt: new Date().toISOString(),
              canEdit: true,
              expiresInSeconds: 86400,
            }
          };
        });
        setTimeLeft(86400);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleDelete = () => {
    if (!userReview) return;
    if (confirm("Are you sure you want to delete your review?")) {
      startTransition(async () => {
        const res = await deleteVendorReview(vendorId, userReview.id);
        if (res.success) {
          toast.success("Review deleted successfully");
          setReviewsData((prev) => {
            const updatedReviews = prev.reviews.filter((r) => r.id !== userReview.id);
            const total = updatedReviews.length;
            const avg = total > 0 ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
            const dist = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
            updatedReviews.forEach(r => {
              const key = String(r.rating) as keyof typeof dist;
              if (key in dist) dist[key]++;
            });

            return {
              ...prev,
              reviews: updatedReviews,
              averageRating: parseFloat(avg.toFixed(1)),
              totalReviews: total,
              distribution: dist,
              eligibility: "eligible",
              userReview: null
            };
          });
          router.refresh();
        } else {
          toast.error(res.message);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Write Review CTA */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-muted/30 p-4 rounded-2xl border">
        <div>
          <h3 className="font-semibold text-lg">Customer Feedback</h3>
          <p className="text-xs text-muted-foreground">
            Only verified customers who purchased from this vendor can leave reviews.
          </p>
        </div>

        {eligibility === "eligible" && (
          <Button
            onClick={handleOpenReviewModal}
            className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-medium cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            Write a Review
          </Button>
        )}

        {eligibility === "already_reviewed" && userReview?.canEdit && (
          <Button
            onClick={handleOpenReviewModal}
            className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-medium cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            Edit Review
          </Button>
        )}
      </div>

      {/* Aggregate Rating distributions */}
      <RatingDistribution
        averageRating={reviewsData.averageRating}
        totalReviews={reviewsData.totalReviews}
        distribution={reviewsData.distribution}
      />

      {/* Pinned User Review */}
      {eligibility === "already_reviewed" && userReview && (
        <div className="border border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 rounded-2xl p-5 space-y-3 relative shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              Your Review
            </span>

            {userReview.canEdit ? (
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  Edit window: <span className="font-bold text-amber-500">{formatTimeLeft(timeLeft)}</span>
                </span>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Locked (Read-Only)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              Y
            </div>
            <span className="font-semibold text-sm">You</span>
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < userReview.rating ? "fill-current text-amber-500" : "text-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed pl-10">
            {userReview.comment || <em className="text-muted-foreground">No written commentary provided.</em>}
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsData.reviews.length === 0 ? (
          <div className="border border-dashed rounded-2xl p-12 bg-card text-sm text-muted-foreground text-center flex flex-col items-center justify-center gap-2">
            <MessageSquarePlus className="w-10 h-10 opacity-30 text-muted-foreground mb-1" />
            <h4 className="font-semibold text-foreground">No reviews yet</h4>
            <p className="max-w-xs mx-auto text-xs">Be the first verified customer to share your shopping experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsData.reviews
              // Filter out the logged user's review if it's already pinned to prevent duplication
              .filter(r => eligibility !== "already_reviewed" || r.id !== userReview?.id)
              .map((review) => (
                <div key={review.id} className="border rounded-2xl p-5 bg-card space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        {review.userInitial}
                      </div>
                      <div>
                        <span className="font-semibold text-sm block leading-none mb-1">{review.userName}</span>
                        <span className="text-[10px] text-muted-foreground leading-none">
                          {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-[10px] font-semibold border border-green-200/50 dark:border-green-900/50">
                          <CheckCircle2 className="w-3 h-3 shrink-0" /> Verified Purchase
                        </span>
                      )}
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? "fill-current text-amber-500" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                    {review.comment}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Ineligible customer view hint */}
      {eligibility === "ineligible" && (
        <div className="border border-dashed rounded-2xl p-6 bg-muted/10 text-center space-y-1">
          <p className="text-sm font-medium text-foreground">Have you purchased from this shop?</p>
          <p className="text-xs text-muted-foreground">
            Complete a checkout with this vendor to leave a review and share your landmark/landmark feedback.
          </p>
        </div>
      )}

      {/* Review Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-500" />
              {eligibility === "already_reviewed" ? "Edit Your Review" : "Write a Vendor Review"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Rate your landmarks location and quality to guide the MarketSight community.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-3">
            {/* Purchase verification trust badge */}
            {verifiedDetails && (
              <div className="bg-green-50 dark:bg-green-950/15 border border-green-200/60 dark:border-green-900/60 p-3 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <div className="text-xs text-green-800 dark:text-green-400">
                  <span className="font-bold block leading-tight">Verified Purchase</span>
                  <span className="block mt-0.5">
                    Purchased: <strong className="text-foreground">{verifiedDetails.itemName}</strong> on {verifiedDetails.date}
                  </span>
                </div>
              </div>
            )}

            {/* Star Rating Touch Targets */}
            <div className="space-y-2 text-center py-2">
              <label className="text-xs font-bold text-foreground block text-left">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center gap-2" role="radiogroup" aria-label="Star rating">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starVal = i + 1;
                  const isActive = hoverRating ? starVal <= hoverRating : starVal <= rating;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground focus:outline-none transition-colors cursor-pointer"
                      role="radio"
                      aria-checked={rating === starVal}
                      aria-label={`${starVal} star`}
                    >
                      <Star
                        className={`w-8 h-8 transition-transform duration-100 ${
                          isActive
                            ? "fill-current text-amber-500 scale-110"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Commentary input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-foreground">Review Commentary</label>
                <span className={`font-semibold ${comment.length >= 400 ? "text-amber-500" : "text-muted-foreground"}`}>
                  {comment.length}/500
                </span>
              </div>
              <Textarea
                placeholder="Share landmarks navigation instructions, delivery performance, teff cleanliness or grain pricing competitiveness..."
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                className="rounded-xl min-h-[120px] text-sm resize-none"
                maxLength={500}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={rating === 0 || isPending}
                className="rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer gap-2"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {eligibility === "already_reviewed" ? "Save Changes" : "Submit Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

