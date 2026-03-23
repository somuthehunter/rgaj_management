import { SelectOption } from "@/components/shared/ListControlsBar";
import { StoreSearchParams } from "@/types/store";
import {
  StoreSortValue,
} from "../_types/store-controls.types";

export const STORE_STATUS_OPTIONS: SelectOption[] = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Deactivated", value: "deactivated" },
];

export const STORE_SORT_OPTIONS: SelectOption[] = [
  { label: "Newest First", value: "newest" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "City A-Z", value: "city-asc" },
  { label: "Most Users", value: "users-desc" },
];

export const STORE_SORT_MAP: Record<
  StoreSortValue,
  Pick<StoreSearchParams, "sortBy" | "sortOrder">
> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  "name-asc": { sortBy: "name", sortOrder: "asc" },
  "city-asc": { sortBy: "city", sortOrder: "asc" },
  "users-desc": { sortBy: "userCount", sortOrder: "desc" },
};
