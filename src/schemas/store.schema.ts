import { z } from "zod";

export const storeSchema = z.object({
  code: z.string().trim().optional(),
  name: z.string().min(1, "Store name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be a 10 digit string"),
});

export type StoreFormValues = z.infer<typeof storeSchema>;
