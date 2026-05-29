import { z } from "zod";

export const vendorReportSchema = z.object({
  vendorId: z.string().uuid(),
  reason: z.enum(["Misleading prices", "Fake products", "Harassment or abuse", "Spam", "Other"]),
  details: z.string().max(500).optional(),
  evidenceUrls: z.array(z.string()).optional(),
});
