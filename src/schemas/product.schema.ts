import { z } from "zod";

export const makingChargeTypes = ["PER_GRAM", "FIXED", "PERCENTAGE"] as const;

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().trim().optional(),
  category: z.string().min(1, "Category is required"),
  purity: z.string().min(1, "Purity is required"),
  hsnCode: z.string().min(1, "HSN code is required"),
  makingChargeType: z.enum(makingChargeTypes, {
    error: "Making charge type must be one of: PER_GRAM, FIXED, PERCENTAGE",
  }),
  makingCharge: z.number().positive("Making charge must be a positive number"),
  gstRate: z
    .number()
    .min(0, "GST rate must be between 0 and 100")
    .max(100, "GST rate must be between 0 and 100"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
