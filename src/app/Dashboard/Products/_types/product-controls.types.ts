import { ProductSearchStatus } from "@/types/product";

export type ProductSortValue =
  | "newest"
  | "name_asc"
  | "name_desc"
  | "qty_asc"
  | "qty_desc"
  | "price_asc"
  | "price_desc";

export type ProductStatusValue = "all" | ProductSearchStatus;
