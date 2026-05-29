"use server";

import { z } from "zod";
import { apiClient, ApiError } from "@/lib/api";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const createExpenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  note: z.string().optional(),
  item: z.number().int().positive().optional(),
  vendor: z.string().uuid().optional(),
  payment_method: z.string().min(1, "Payment method is required").default("Cash"),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export async function createExpenseAction(input: CreateExpenseInput): Promise<ActionResult<{ id: number }>> {
  const result = createExpenseSchema.safeParse(input);
  
  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  try {
    const data = await apiClient<{ id: number }>({
      method: "POST",
      endpoint: "/api/finance/expenses/",
      body: result.data,
    });
    console.log(data)
    revalidateTag("expenses","max");
    return { success: true, data };
  } catch (error) {
      // console.log(error)
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
