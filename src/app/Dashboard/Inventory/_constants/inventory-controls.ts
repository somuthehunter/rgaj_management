import { InventorySortValue } from "../_types/inventory-controls.types";

export const INVENTORY_SORT_OPTIONS: { label: string; value: InventorySortValue }[] =
  [
    { label: "Newest", value: "newest" },
    { label: "Product (A-Z)", value: "product_asc" },
    { label: "Product (Z-A)", value: "product_desc" },
    { label: "Store (A-Z)", value: "store_asc" },
    { label: "Store (Z-A)", value: "store_desc" },
    { label: "Quantity (Low to High)", value: "qty_asc" },
    { label: "Quantity (High to Low)", value: "qty_desc" },
  ];

export const INVENTORY_SORT_MAP: Record<
  InventorySortValue,
  { sortBy?: string; sortOrder?: "asc" | "desc" }
> = {
  newest: {},
  product_asc: { sortBy: "productName", sortOrder: "asc" },
  product_desc: { sortBy: "productName", sortOrder: "desc" },
  store_asc: { sortBy: "storeName", sortOrder: "asc" },
  store_desc: { sortBy: "storeName", sortOrder: "desc" },
  qty_asc: { sortBy: "quantityNumber", sortOrder: "asc" },
  qty_desc: { sortBy: "quantityNumber", sortOrder: "desc" },
};
