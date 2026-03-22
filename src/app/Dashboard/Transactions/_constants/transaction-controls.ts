import { SelectOption } from "@/components/shared/ListControlsBar";
import { TransactionSearchParams } from "@/types/transaction";
import { TransactionSortValue } from "../_types/transaction-controls.types";

export const TRANSACTION_EVENT_OPTIONS: SelectOption[] = [
  { label: "All Events", value: "all" },
  { label: "Add Product", value: "ADD_PRODUCT" },
  { label: "Add Category", value: "ADD_CATEGORY" },
  { label: "Remove Product", value: "REMOVE_PRODUCT" },
  { label: "Sell", value: "SELL" },
  { label: "Return", value: "RETURN" },
  { label: "Create User", value: "CREATE_USER" },
  { label: "Distribute", value: "DISTRIBUTE" },
];

export const TRANSACTION_SORT_OPTIONS: SelectOption[] = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Event A-Z", value: "event-asc" },
  { label: "Actor A-Z", value: "actor-asc" },
];

export const TRANSACTION_SORT_MAP: Record<
  TransactionSortValue,
  Pick<TransactionSearchParams, "sortBy" | "sortOrder">
> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  oldest: { sortBy: "createdAt", sortOrder: "asc" },
  "event-asc": { sortBy: "eventType", sortOrder: "asc" },
  "actor-asc": { sortBy: "performedBy", sortOrder: "asc" },
};
