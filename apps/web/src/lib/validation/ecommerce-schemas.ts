import { z } from "zod";

const identifierSchema = z.union([
  z.string().min(1),
  z.number().int().positive(),
]);
const uuidSchema = z.string().uuid();

export const addToCartSchema = z.object({
  listing_id: z.number().int().positive(),
  vendor_id: uuidSchema,
  vendor_name: z.string().trim().max(200).optional(),
  item_name: z.string().trim().min(1).max(200),
  unit_price: z.number().positive(),
  unit: z.string().trim().min(1).max(40).optional(),
  quantity: z.number().int().min(1).max(999).default(1),
});

export const checkoutSchema = z.object({
  vendor_id: uuidSchema,
  listing_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999).default(1),
  delivery_address: z.string().trim().max(500).optional().or(z.literal("")),
  payment_method: z.enum(["chapa", "telebirr", "cash"]).default("chapa"),
});

export const bulkCheckoutSchema = z.object({
  items: z.array(z.object({
    vendor_id: uuidSchema,
    listing_id: z.number().int().positive(),
    quantity: z.number().int().min(1).max(999).default(1),
  })).min(1),
  payment_method: z.enum(["chapa", "telebirr", "cash"]).default("chapa"),
});

export const paymentSchema = z.object({
  purchase_id: uuidSchema,
  payment_method: z.enum(["chapa", "telebirr", "cash"]).default("chapa"),
});

export const recommendationQuerySchema = z.object({
  item_id: z.number().int().positive(),
  city: z.string().trim().min(1).max(120).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export const purchaseStatusUpdateSchema = z.object({
  purchase_id: uuidSchema,
  status: z.enum(["shipped", "delivered", "cancelled"]),
});

export const vendorListingCreateSchema = z.object({
  vendor_id: uuidSchema,
  item: z.number().int().positive(),
  price: z.number().positive(),
  base_price: z.number().positive().optional().nullable(),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  variant: z.string().trim().max(200).optional().or(z.literal("")),
  stock_count: z.number().int().min(0),
});

export const vendorRegisterSchema = z.object({
  shop_name: z.string().trim().min(2).max(200),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  address: z.string().trim().max(250).optional().or(z.literal("")),
  contact_phone: z.string().trim().max(50).optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const reviewCreateSchema = z.object({
  vendor_id: uuidSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type AddToCartSchema = z.infer<typeof addToCartSchema>;
export type CheckoutSchema = z.infer<typeof checkoutSchema>;
export type BulkCheckoutSchema = z.infer<typeof bulkCheckoutSchema>;
export type PaymentSchema = z.infer<typeof paymentSchema>;
export type RecommendationQuerySchema = z.infer<
  typeof recommendationQuerySchema
>;
export type PurchaseStatusUpdateSchema = z.infer<
  typeof purchaseStatusUpdateSchema
>;
export type ReviewCreateSchema = z.infer<typeof reviewCreateSchema>;
export type VendorListingCreateSchema = z.infer<
  typeof vendorListingCreateSchema
>;
export type VendorRegisterSchema = z.infer<typeof vendorRegisterSchema>;

export { identifierSchema };
