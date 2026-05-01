import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  description: z.string().trim().optional().or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
