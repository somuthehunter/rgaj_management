import { SelectOption } from "@/components/shared/ListControlsBar";
import { TransactionSearchParams } from "@/types/transaction";
import { TransactionSortValue } from "../_types/transaction-controls.types";

export const TRANSACTION_ACTION_OPTIONS: SelectOption[] = [
  { label: "All Actions", value: "all" },
  { label: "Create", value: "CREATE" },
  { label: "Update", value: "UPDATE" },
  { label: "Delete", value: "DELETE" },
  { label: "Activate", value: "ACTIVATE" },
  { label: "Login", value: "LOGIN" },
  { label: "Logout", value: "LOGOUT" },
  { label: "Allocate", value: "ALLOCATE" },
  { label: "Sell", value: "SELL" },
  { label: "Refund", value: "REFUND" },
  { label: "Cancel", value: "CANCEL" },
];

export const TRANSACTION_ENTITY_OPTIONS: SelectOption[] = [
  { label: "All Entities", value: "all" },
  { label: "Auth", value: "AUTH" },
  { label: "User", value: "USER" },
  { label: "Store", value: "STORE" },
  { label: "Product", value: "PRODUCT" },
  { label: "Inventory", value: "INVENTORY" },
  { label: "Invoice", value: "INVOICE" },
  { label: "Customer", value: "CUSTOMER" },
  { label: "Refund", value: "REFUND" },
];

export const TRANSACTION_SORT_OPTIONS: SelectOption[] = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Action A-Z", value: "action-asc" },
  { label: "Entity A-Z", value: "entity-asc" },
  { label: "User A-Z", value: "user-asc" },
];

export const TRANSACTION_SORT_MAP: Record<
  TransactionSortValue,
  Pick<TransactionSearchParams, "sortBy" | "sortOrder">
> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  oldest: { sortBy: "createdAt", sortOrder: "asc" },
  "action-asc": { sortBy: "action", sortOrder: "asc" },
  "entity-asc": { sortBy: "entity", sortOrder: "asc" },
  "user-asc": { sortBy: "userId", sortOrder: "asc" },
};
