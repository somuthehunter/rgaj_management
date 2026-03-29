import { z } from "zod";
import { UserRole } from "@/types";

export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  role: z.nativeEnum(UserRole),
  storeId: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;
