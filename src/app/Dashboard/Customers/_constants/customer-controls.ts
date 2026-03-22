import { SelectOption } from "@/components/shared/ListControlsBar";
import { CustomerSearchParams } from "@/types/customer";
import { CustomerSortValue } from "../_types/customer-controls.types";

export const CUSTOMER_SORT_OPTIONS: SelectOption[] = [
  { label: "Newest Customer Activity", value: "latest" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
  { label: "Highest Purchase", value: "highest-purchase" },
  { label: "Lowest Purchase", value: "lowest-purchase" },
  { label: "Most Items", value: "most-items" },
  { label: "Least Items", value: "least-items" },
];

export const CUSTOMER_SORT_MAP: Record<
  CustomerSortValue,
  Pick<CustomerSearchParams, "sortBy" | "sortOrder">
> = {
  latest: { sortBy: "lastOrderDate", sortOrder: "desc" },
  "name-asc": { sortBy: "name", sortOrder: "asc" },
  "name-desc": { sortBy: "name", sortOrder: "desc" },
  "highest-purchase": { sortBy: "totalPurchase", sortOrder: "desc" },
  "lowest-purchase": { sortBy: "totalPurchase", sortOrder: "asc" },
  "most-items": { sortBy: "itemsPurchased", sortOrder: "desc" },
  "least-items": { sortBy: "itemsPurchased", sortOrder: "asc" },
};
