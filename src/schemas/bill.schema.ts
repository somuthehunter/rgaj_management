import { z } from "zod";

export const paymentMethods = ["CASH", "CARD", "UPI", "BANK_TRANSFER"] as const;

export const billItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z
    .number({ error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

export const billSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerEmail: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  customerAddress: z.string().trim().optional(),
  paymentMethod: z.enum(paymentMethods, {
    error: "Please select a payment method",
  }),
  notes: z.string().trim().optional(),
  items: z.array(billItemSchema).min(1, "Add at least one item"),
});

export type BillFormValues = z.infer<typeof billSchema>;
