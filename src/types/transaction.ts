export type SystemEventType =
  | "ADD_PRODUCT"
  | "ADD_CATEGORY"
  | "REMOVE_PRODUCT"
  | "SELL"
  | "RETURN"
  | "CREATE_USER"
  | "DISTRIBUTE";

export type TransactionLogItem = {
  id: string;
  eventType: SystemEventType;
  module: "Inventory" | "Products" | "Categories" | "Orders" | "Users";
  title: string;
  description: string;
  performedBy: string;
  role: string;
  storeName?: string;
  entityName?: string;
  referenceId?: string;
  createdAt: string;
  metadata?: Record<string, string | number>;
};

export type TransactionSearchParams = {
  search?: string;
  eventType?: SystemEventType | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};
