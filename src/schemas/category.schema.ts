import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
