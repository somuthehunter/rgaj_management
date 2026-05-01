export type InventoryMeasurementUnit = "ratti" | "carat";

export type InventoryListItem = {
  id: string;
  storeId: string;
  storeName: string;
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  quantityNumber: number;
  measuredQuantity: number;
  measuredUnit: InventoryMeasurementUnit;
  soldWeight?: number;
  returnedWeight?: number;
  stoneWeight?: number;
  updatedAt: string;
};

export type InventoryAllocationPayload = {
  productId: string;
  storeId: string;
  weight: number;
  stoneCount?: number;
  stoneWeight?: number;
  notes?: string;
};

export type CentralInventoryPayload = {
  productId: string;
  totalWeight: number;
  totalStones?: number;
  stoneWeight?: number;
  notes?: string;
};

export type InventoryTransferPayload = {
  fromStoreId: string;
  toStoreId: string;
  productId: string;
  weight: number;
};

export type InventoryAdjustPayload = {
  weightDelta: number;
  notes?: string;
};

export type CentralInventoryListItem = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  totalWeight: number;
  availableWeight: number;
  reservedWeight: number;
  totalStones: number;
  reservedStones: number;
  stoneWeight: number;
  netGoldWeight: number;
  updatedAt: string;
};

export type InventorySummaryItem = {
  store: {
    id: string;
    name: string;
    code: string;
  };
  totalAllocatedWeight: number;
  totalSoldWeight: number;
  totalAvailableWeight: number;
  totalReturnedWeight: number;
  productCount: number;
};

export type InventoryLedgerType = "ALLOCATION" | "SALE" | "REFUND" | "ADJUSTMENT";

export type InventoryLedgerItem = {
  id: string;
  type: InventoryLedgerType;
  productId: string;
  fromStoreId?: string | null;
  toStoreId?: string | null;
  weight: number;
  stoneCount: number;
  stoneWeight: number;
  netGoldWeight: number;
  reference: string;
  invoiceId?: string | null;
  refundId?: string | null;
  notes?: string | null;
  performedBy: string;
  createdAt: string;
};

export type InventoryLedgerSummaryItem = {
  type: InventoryLedgerType;
  totalWeight: number;
  totalNetGoldWeight: number;
  count: number;
};

export type InventorySearchParams = {
  search?: string;
  storeId?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};

export type InventoryLedgerSearchParams = {
  type?: InventoryLedgerType | "";
  productId?: string;
  storeId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
};
