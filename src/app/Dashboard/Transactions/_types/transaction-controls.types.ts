export type TransactionActionValue =
  | "all"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ACTIVATE"
  | "LOGIN"
  | "LOGOUT"
  | "ALLOCATE"
  | "SELL"
  | "REFUND"
  | "CANCEL";

export type TransactionEntityValue =
  | "all"
  | "AUTH"
  | "USER"
  | "STORE"
  | "PRODUCT"
  | "INVENTORY"
  | "INVOICE"
  | "CUSTOMER"
  | "REFUND";

export type TransactionSortValue =
  | "newest"
  | "oldest"
  | "action-asc"
  | "entity-asc"
  | "user-asc";
