import { ApiErrorPayload } from "@/types/product";
import { UserFormValues } from "@/schemas/user.schema";
import { UserListItem } from "@/types/user";
import { UserRole } from "@/types";

export const getUserEntityErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback;

  const err = error as Error & { data?: unknown };
  const payload = err?.data as ApiErrorPayload | undefined;
  const details = payload?.error?.details ?? payload?.details;

  if (Array.isArray(details)) {
    const detailMessage = details
      .map((item) => item?.message)
      .filter((message): message is string => Boolean(message))
      .join(" | ");

    if (detailMessage) return detailMessage;
  }

  return payload?.error?.message || payload?.message || err?.message || fallback;
};

export const isUserEntityActive = (user: UserListItem) => {
  if (typeof user.isActive === "boolean") return user.isActive;
  if (typeof user.status === "string") return user.status.toUpperCase() === "ACTIVE";
  if (user.deactivatedAt) return false;
  return true;
};

export const getUserFormDefaults = (user?: UserListItem): UserFormValues => ({
  firstName: user?.firstName ?? "",
  lastName: user?.lastName ?? "",
  email: user?.email ?? "",
  password: "",
  role: user?.role ?? UserRole.STORE_ADMIN,
  storeId: user?.storeId ?? "",
});
