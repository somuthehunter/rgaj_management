import { SelectOption } from "@/components/shared/ListControlsBar";
import { OrderSearchParams } from "@/types/order";
import { OrderSortValue } from "../_types/order-controls.types";

export const ORDER_STATUS_OPTIONS: SelectOption[] = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export const ORDER_SORT_OPTIONS: SelectOption[] = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Highest Total", value: "highest-total" },
  { label: "Lowest Total", value: "lowest-total" },
  { label: "Store A-Z", value: "store-asc" },
  { label: "Store Z-A", value: "store-desc" },
];

export const ORDER_SORT_MAP: Record<
  OrderSortValue,
  Pick<OrderSearchParams, "sortBy" | "sortOrder">
> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  oldest: { sortBy: "createdAt", sortOrder: "asc" },
  "highest-total": { sortBy: "total", sortOrder: "desc" },
  "lowest-total": { sortBy: "total", sortOrder: "asc" },
  "store-asc": { sortBy: "storeName", sortOrder: "asc" },
  "store-desc": { sortBy: "storeName", sortOrder: "desc" },
};
