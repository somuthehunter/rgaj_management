import { UserRole } from "@/types";

type RoleLike = string | null | undefined;

export const normalizeRole = (role: RoleLike): UserRole | null => {
  if (!role) return null;

  const upperRole = role.toUpperCase();

  if (upperRole === UserRole.SUPER_ADMIN || upperRole === "ADMIN") {
    return UserRole.SUPER_ADMIN;
  }

  if (upperRole === UserRole.STORE_ADMIN) {
    return UserRole.STORE_ADMIN;
  }

  if (upperRole === UserRole.CASHIER) {
    return UserRole.CASHIER;
  }

  return null;
};
