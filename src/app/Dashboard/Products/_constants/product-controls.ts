import { ProductSortValue } from "../_types/product-controls.types";

export const PRODUCT_STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Deactivated", value: "deactivated" },
];

export const PRODUCT_SORT_OPTIONS: { label: string; value: ProductSortValue }[] =
  [
    { label: "Newest", value: "newest" },
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
    { label: "Quantity (Low to High)", value: "qty_asc" },
    { label: "Quantity (High to Low)", value: "qty_desc" },
    { label: "Price (Low to High)", value: "price_asc" },
    { label: "Price (High to Low)", value: "price_desc" },
  ];

export const PRODUCT_SORT_MAP: Record<
  ProductSortValue,
  { sortBy?: string; sortOrder?: "asc" | "desc" }
> = {
  newest: {},
  name_asc: { sortBy: "name", sortOrder: "asc" },
  name_desc: { sortBy: "name", sortOrder: "desc" },
  qty_asc: { sortBy: "quantity", sortOrder: "asc" },
  qty_desc: { sortBy: "quantity", sortOrder: "desc" },
  price_asc: { sortBy: "price", sortOrder: "asc" },
  price_desc: { sortBy: "price", sortOrder: "desc" },
};
