import { ApiErrorPayload, ProductListItem } from "@/types/product";
import { ProductFormValues, weightUnits } from "@/schemas/product.schema";

export const getProductErrorMessage = (
  error: unknown,
  fallback: string,
) => {
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
    payload?.error?.message ||
    payload?.message ||
    err?.message ||
    fallback
  );
};

export const isProductActive = (product: ProductListItem) => {
  if (typeof product?.isActive === "boolean") return product.isActive;
  if (typeof product?.active === "boolean") return product.active;
  if (typeof product?.status === "string") {
    return product.status.toUpperCase() === "ACTIVE";
  }
  if (product?.deactivatedAt) return false;
  return true;
};

export const getProductFormDefaults = (
  product?: ProductListItem,
): ProductFormValues => ({
  name: product?.name ?? "",
  sku: product?.sku === "N/A" ? "" : (product?.sku ?? ""),
  categoryId: product?.categoryId ?? "",
  weightUnit:
    product?.weightUnit && weightUnits.includes(product.weightUnit)
      ? product.weightUnit
      : "CARAT",
  pricePerUnit: Number(product?.pricePerUnit ?? 0),
  hsnCode: product?.hsnCode ?? "",
  gstRate: Number(product?.gstRate ?? 3),
});
