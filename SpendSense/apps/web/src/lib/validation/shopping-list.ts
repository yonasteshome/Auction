import { z } from "zod";

export const shoppingListSchema = z.object({
  // Accept either a UUID or a non-empty string ID (some listings use numeric IDs)
  itemId: z.union([z.string().uuid(), z.string().min(1)]),
  quantity: z.number().positive(),
  unit: z.string(),
});
