import { z } from "zod";

export const weightUnits = ["RATI", "CARAT"] as const;

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().trim().optional(),
  categoryId: z.string().min(1, "Category is required"),
  weightUnit: z.enum(weightUnits, {
    error: "Weight unit must be RATI or CARAT",
  }),
  pricePerUnit: z
    .number({ error: "Price per unit is required" })
    .positive("Price per unit must be greater than 0"),
  hsnCode: z.string().trim().min(1, "HSN code is required"),
  gstRate: z
    .number({ error: "GST rate is required" })
    .min(0, "GST rate must be between 0 and 100")
    .max(100, "GST rate must be between 0 and 100"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
