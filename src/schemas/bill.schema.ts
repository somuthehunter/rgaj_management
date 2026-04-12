import { z } from "zod";

export const paymentMethods = ["CASH", "CARD", "UPI", "MIXED"] as const;

const optionalTextField = z.string().trim().optional().or(z.literal(""));
const optionalPhoneField = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
  .optional()
  .or(z.literal(""));
const optionalEmailField = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .optional()
  .or(z.literal(""));

export const billItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  weight: z
    .number({ error: "Weight is required" })
    .positive("Weight must be greater than 0"),
  stoneCount: z
    .number({ error: "Stone count must be a number" })
    .int("Stone count must be a whole number")
    .min(0, "Stone count cannot be negative")
    .optional(),
});

export const billSchema = z.object({
  storeId: z.string().optional(),
  customerName: optionalTextField,
  customerPhone: optionalPhoneField,
  customerEmail: optionalEmailField,
  customerAddress: optionalTextField,
  paymentMethod: z.enum(paymentMethods, {
    error: "Please select a payment method",
  }),
  items: z.array(billItemSchema).min(1, "Add at least one item"),
});

export type BillFormValues = z.infer<typeof billSchema>;
