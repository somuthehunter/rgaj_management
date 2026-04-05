import { z } from "zod";
import { UserRole } from "@/types";

export const userSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Valid email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  role: z.nativeEnum(UserRole),
  storeId: z.string().optional(),
}).superRefine((value, ctx) => {
  if (value.role !== UserRole.SUPER_ADMIN && !value.storeId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["storeId"],
      message: "Store is required for Store Admin and Cashier.",
    });
  }
});

export type UserFormValues = z.infer<typeof userSchema>;
