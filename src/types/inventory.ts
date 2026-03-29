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

export type InventorySearchParams = {
  search?: string;
  storeId?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};
