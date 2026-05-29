import { z } from "zod";

export const priceAlertInputSchema = z.object({
  itemId: z.string(),
  targetPrice: z.coerce.number().positive({ message: "Target price must be a positive number" }),
  city: z.string().optional(),
  alertMethods: z.array(z.enum(["in-app", "email", "sms"])).min(1, { message: "Select at least one notification method" }).default(["in-app"]),
  expiryDays: z.enum(["7", "30", "90"]).default("30"),
});

export type PriceAlertInput = z.infer<typeof priceAlertInputSchema>;
