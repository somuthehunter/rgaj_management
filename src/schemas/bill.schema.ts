import { z } from "zod";

export const paymentMethods = ["CASH", "CARD", "UPI", "MIXED"] as const;

const optionalTextField = z.string().trim().optional().or(z.literal(""));

export const billItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  actualWeight: z
    .number({ error: "Weight is required" })
    .positive("Weight must be greater than 0"),
  stoneWeight: z
    .number({ error: "Stone weight must be a number" })
    .min(0, "Stone weight cannot be negative")
    .optional(),
  stoneCount: z
    .number({ error: "Stone count must be a number" })
    .int("Stone count must be a whole number")
    .min(0, "Stone count cannot be negative")
    .optional(),
});

export const billSchema = z.object({
  storeId: z.string().optional(),
  customerName: optionalTextField,
  customerPhone: optionalTextField,
  customerEmail: optionalTextField,
  customerAddress: optionalTextField,
  goldRatePerGram: z
    .number({ error: "Gold rate is required" })
    .positive("Gold rate must be greater than 0"),
  paymentMethod: z.enum(paymentMethods, {
    error: "Please select a payment method",
  }),
  items: z.array(billItemSchema).min(1, "Add at least one item"),
});

export type BillFormValues = z.infer<typeof billSchema>;
