import { z } from "zod";

export const storeSchema = z.object({
  code: z.string().min(1, "Store code is required"),
  name: z.string().min(1, "Store name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  phone: z.string().min(1, "Phone number is required"),
  managerName: z.string().min(1, "Manager name is required"),
});

export type StoreFormValues = z.infer<typeof storeSchema>;
