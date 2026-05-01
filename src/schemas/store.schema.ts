import { z } from "zod";

export const storeSchema = z.object({
  code: z.string().trim().optional(),
  name: z.string().trim().min(1, "Store name is required"),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be a 10 digit string"),
});

export type StoreFormValues = z.infer<typeof storeSchema>;
