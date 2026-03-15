import { CategoryFormValues } from "@/schemas/category.schema";
import { CategoryListItem } from "@/types/category";

export const getCategoryErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (!error) return fallback;

  const err = error as Error;
  return err.message || fallback;
};

export const isCategoryActive = (category: CategoryListItem) => {
  if (typeof category?.isActive === "boolean") return category.isActive;
  if (typeof category?.active === "boolean") return category.active;
  if (typeof category?.status === "string") {
    return category.status.toUpperCase() === "ACTIVE";
  }
  return true;
};

export const slugifyCategoryName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getCategoryFormDefaults = (
  category?: CategoryListItem,
): CategoryFormValues => ({
  name: category?.name ?? "",
  slug: category?.slug ?? "",
  description: category?.description ?? "",
});
