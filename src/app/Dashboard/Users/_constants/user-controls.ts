import { SelectOption } from "@/components/shared/ListControlsBar";
import { UserRole } from "@/types";
import { UserSearchParams } from "@/types/user";
import { UserSortValue } from "../_types/user-controls.types";

export const USER_STATUS_OPTIONS: SelectOption[] = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Deactivated", value: "deactivated" },
];

export const USER_ROLE_OPTIONS: SelectOption[] = [
  { label: "All Roles", value: "all" },
  { label: "Super Admin", value: UserRole.SUPER_ADMIN },
  { label: "Store Admin", value: UserRole.STORE_ADMIN },
  { label: "Cashier", value: UserRole.CASHIER },
];

export const USER_SORT_OPTIONS: SelectOption[] = [
  { label: "Newest First", value: "newest" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Email A-Z", value: "email-asc" },
  { label: "Role A-Z", value: "role-asc" },
];

export const USER_SORT_MAP: Record<
  UserSortValue,
  Pick<UserSearchParams, "sortBy" | "sortOrder">
> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  "name-asc": { sortBy: "name", sortOrder: "asc" },
  "email-asc": { sortBy: "email", sortOrder: "asc" },
  "role-asc": { sortBy: "role", sortOrder: "asc" },
};
