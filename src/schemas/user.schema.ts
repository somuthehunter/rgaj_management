import { z } from "zod";
import { UserRole } from "@/types";

export const userSchema = z.object({
  name: z.string().min(1, "User name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.nativeEnum(UserRole),
  storeId: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;
