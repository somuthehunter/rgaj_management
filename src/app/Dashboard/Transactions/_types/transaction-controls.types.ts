export type TransactionEventValue =
  | "all"
  | "ADD_PRODUCT"
  | "ADD_CATEGORY"
  | "REMOVE_PRODUCT"
  | "SELL"
  | "RETURN"
  | "CREATE_USER"
  | "DISTRIBUTE";

export type TransactionSortValue =
  | "newest"
  | "oldest"
  | "event-asc"
  | "actor-asc";
