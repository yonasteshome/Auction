import { z } from "zod";

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const maxPastDate = () => {
  const d = today();
  d.setDate(d.getDate() - 7);
  return d;
};

export const timeObservedSchema = z.enum(["morning", "afternoon", "evening", ""]);

export const createPriceSubmissionSchema = z.object({
  item_id: z.coerce.number().int().positive(),
  price_value: z.coerce
    .number()
    .positive("Price must be a positive number.")
    .max(999_999, "Price cannot exceed 999,999 ETB."),
  unit: z.string().min(1).max(30),
  market_location: z.string().min(1).max(120),
  city: z.string().min(1).max(120),
  vendor_name: z.string().max(120).optional().default(""),
  date_observed: z.coerce.date().refine(
    (d) => d <= today(),
    "Future dates are not allowed.",
  ).refine(
    (d) => d >= maxPastDate(),
    "Observation date must be within the last 7 days.",
  ),
  time_observed: timeObservedSchema.optional().default(""),
  quality_grade: z.string().max(60).optional().default(""),
  quantity_available: z.coerce.number().positive().optional().nullable(),
  notes: z.string().max(500).optional().default(""),
  confirm_outlier: z.boolean().optional().default(false),
});

export type CreatePriceSubmissionInput = z.infer<typeof createPriceSubmissionSchema>;

export const updatePriceSubmissionSchema = createPriceSubmissionSchema.partial().extend({
  id: z.coerce.number().int().positive(),
});

export type UpdatePriceSubmissionInput = z.infer<typeof updatePriceSubmissionSchema>;

export const priceSubmissionResponseSchema = z.object({
  id: z.number(),
  item_id: z.number(),
  item_name: z.string(),
  item_category: z.string(),
  price_value: z.string(),
  unit: z.string(),
  market_location: z.string(),
  city: z.string(),
  vendor_name: z.string(),
  date_observed: z.string(),
  time_observed: z.string(),
  quality_grade: z.string(),
  quantity_available: z.string().nullable(),
  notes: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  rejection_reason: z.string(),
  outlier_flag: z.boolean(),
  image: z.string().nullable(),
  created_at: z.string(),
  outlier_warning: z.string().nullable(),
});

export const mySubmissionSchema = z.object({
  id: z.number(),
  item_name: z.string(),
  item_category: z.string(),
  price_value: z.string(),
  unit: z.string(),
  market_location: z.string(),
  city: z.string(),
  vendor_name: z.string(),
  date_observed: z.string(),
  time_observed: z.string(),
  quality_grade: z.string(),
  quantity_available: z.string().nullable(),
  notes: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  rejection_reason: z.string(),
  outlier_flag: z.boolean(),
  image_url: z.string().nullable(),
  created_at: z.string(),
});

export const mySubmissionsListSchema = z.object({
  results: z.array(mySubmissionSchema),
  pagination: z.object({
    total_records: z.number(),
    total_pages: z.number(),
    page_size: z.number(),
    current_page: z.number(),
  }),
});

export const contributorStatsSchema = z.object({
  total_submissions: z.number(),
  approved: z.number(),
  pending: z.number(),
  rejected: z.number(),
  points: z.number(),
  level: z.string(),
  badge_color: z.enum(["gold", "silver", "bronze"]),
  rank_progress: z.number(),
  week_submissions: z.number(),
  total_week_submissions: z.number(),
  items_covered: z.number(),
  markets_covered: z.number(),
});

export const itemAveragesSchema = z.object({
  item_id: z.number(),
  national_average: z.string().nullable(),
  city_average: z.string().nullable(),
  location_average: z.string().nullable(),
  recent_submissions: z.array(
    z.object({
      price: z.string(),
      date: z.string(),
      location: z.string(),
      city: z.string(),
    }),
  ),
  total_submissions: z.number(),
});
