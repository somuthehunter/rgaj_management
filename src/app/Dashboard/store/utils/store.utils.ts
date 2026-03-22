import { ApiErrorPayload } from "@/types/product"; // reuse if same structure
import { StoreListItem } from "@/types/store";
import { StoreFormValues } from "@/schemas/store.schema";

/**
 * 🔴 Error Handler (same as product)
 */
export const getStoreErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback;

  const err = error as Error & { data?: unknown };
  const payload = err?.data as ApiErrorPayload | undefined;

  const details = payload?.error?.details ?? payload?.details;

  if (Array.isArray(details)) {
    const detailMessage = details
      .map((item) => item?.message)
      .filter((msg): msg is string => Boolean(msg))
      .join(" | ");

    if (detailMessage) return detailMessage;
  }

  return (
    payload?.error?.message || payload?.message || err?.message || fallback
  );
};

/**
 * 🟢 Active Status Checker
 */
export const isStoreActive = (store: StoreListItem) => {
  if (typeof store?.isActive === "boolean") return store.isActive;

  if (typeof store?.status === "string") {
    return store.status.toUpperCase() === "ACTIVE";
  }

  if (store?.deactivatedAt) return false;

  return true;
};

/**
 * 📝 Form Defaults
 */
export const getStoreFormDefaults = (
  store?: StoreListItem,
): StoreFormValues => ({
  code: store?.code ?? "",
  name: store?.name ?? "",
  address: store?.address ?? "",
  city: store?.city ?? "",
  state: store?.state ?? "",
  phone: store?.phone ?? "",
});
