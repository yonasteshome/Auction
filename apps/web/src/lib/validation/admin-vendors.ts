import { z } from "zod";

export const adminVendorSchema = z.object({
  id: z.string(),
  shop_name: z.string(),
  city: z.string(),
  address: z.string(),
  contact_phone: z.string(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  is_verified: z.boolean(),
  verification_status: z.enum(["unrequested", "requested", "pending", "verified", "rejected", "suspended"]),
  verification_rejection_reason: z.string().optional().default(""),
  business_license: z.string().nullable(),
  tin_number: z.string(),
  rating_avg: z.string(),
  rating_count: z.number(),
  joined_at: z.string(),
  report_count: z.number().optional(),
  latest_report_reason: z.string().optional().default(""),
  latest_reported_at: z.string().nullable().optional(),
  owner_name: z.string(),
  owner_email: z.string(),
});

export const adminVendorPaginationSchema = z.object({
  total_records: z.number(),
  total_pages: z.number(),
  page_size: z.number(),
  current_page: z.number(),
});

export const adminVendorListSchema = z.object({
  pagination: adminVendorPaginationSchema,
  results: z.array(adminVendorSchema),
  stats: z.object({
    total: z.number(),
    verified: z.number(),
    pending: z.number(),
    rejected: z.number(),
    suspended: z.number(),
    unrequested: z.number(),
    status_breakdown: z.object({
      verified: z.number(),
      pending: z.number(),
      rejected: z.number(),
      suspended: z.number(),
      unrequested: z.number(),
    }),
  }).optional(),
  active_status: z.enum(["all", "verified", "pending", "rejected", "suspended"]).optional(),
  search: z.string().optional(),
});
