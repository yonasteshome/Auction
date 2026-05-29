import { z } from "zod";

export const adminSubmissionSchema = z.object({
  id: z.number(),
  item: z.number(),
  item_name: z.string(),
  price_value: z.string(),
  unit: z.string().default(""),
  market_location: z.string(),
  city: z.string(),
  vendor_name: z.string().default(""),
  date_observed: z.string(),
  time_observed: z.string().default(""),
  quality_grade: z.string().default(""),
  quantity_available: z.string().nullable().default(null),
  notes: z.string().default(""),
  status: z.enum(["pending", "approved", "rejected"]),
  rejection_reason: z.string().default(""),
  outlier_flag: z.boolean().default(false),
  image: z.string().nullable().default(null),
  created_at: z.string(),
  submitter_email: z.string(),
});

export const adminSubmissionsListSchema = z.object({
  results: z.array(adminSubmissionSchema),
  pagination: z.object({
    total_records: z.number(),
    total_pages: z.number(),
    page_size: z.number(),
    current_page: z.number(),
  }),
});

export type AdminSubmissionSchema = z.infer<typeof adminSubmissionSchema>;
