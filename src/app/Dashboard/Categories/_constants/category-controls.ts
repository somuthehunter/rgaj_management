import { CategorySortValue } from "../_types/category-controls.types";

export const CATEGORY_STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Deactivated", value: "deactivated" },
];

export const CATEGORY_SORT_OPTIONS: { label: string; value: CategorySortValue }[] =
  [
    { label: "Newest", value: "newest" },
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
    { label: "Products (Low to High)", value: "count_asc" },
    { label: "Products (High to Low)", value: "count_desc" },
  ];

export const CATEGORY_SORT_MAP: Record<
  CategorySortValue,
  { sortBy?: string; sortOrder?: "asc" | "desc" }
> = {
  newest: {},
  name_asc: { sortBy: "name", sortOrder: "asc" },
  name_desc: { sortBy: "name", sortOrder: "desc" },
  count_asc: { sortBy: "productCount", sortOrder: "asc" },
  count_desc: { sortBy: "productCount", sortOrder: "desc" },
};
