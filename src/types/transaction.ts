export type TransactionLogItem = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  changes?: unknown;
  createdAt: string;
};

export type TransactionSearchParams = {
  search?: string;
  action?: string;
  entity?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};

export type SalesReport = {
  summary: {
    totalInvoices: number;
    totalSales: number;
    totalGst: number;
    totalSubtotal: number;
  };
  byStore: SalesStoreBreakdown[];
  byPaymentMethod: SalesPaymentBreakdown[];
};

export type SalesStoreBreakdown = {
  storeId: string;
  storeName: string;
  storeCode: string;
  invoiceCount: number;
  totalSales: number;
  totalGst: number;
};

export type SalesPaymentBreakdown = {
  method: "CASH" | "CARD" | "UPI" | "MIXED";
  count: number;
  total: number;
};

export type InventoryAuditRow = {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  purity: string;
  centralTotalWeight: number;
  centralAvailableWeight: number;
  centralReservedWeight: number;
  centralNetGoldWeight: number;
  allocatedWeight: number;
  soldWeight: number;
  availableWeight: number;
  returnedWeight: number;
};

export type StoreAuditReport = {
  store: {
    id: string;
    name: string;
    code: string;
    city: string;
    userCount: number;
  };
  sales: {
    invoiceCount: number;
    totalSales: number;
    totalGst: number;
  };
  refunds: {
    refundCount: number;
    totalRefunded: number;
  };
  topInventory: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    category: string;
    allocatedWeight: number;
    soldWeight: number;
    returnedWeight: number;
    availableWeight: number;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    customerName: string | null;
    customerPhone: string | null;
  }>;
};
