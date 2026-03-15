import { CategorySearchStatus } from "@/types/category";

export type CategorySortValue =
  | "newest"
  | "name_asc"
  | "name_desc"
  | "count_asc"
  | "count_desc";

export type CategoryStatusValue = "all" | CategorySearchStatus;
