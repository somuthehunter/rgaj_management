import { getService, patchService, postService } from "./service";
import endpoints from "@/constants/query_const";
import { PaginatedResponse } from "@/types";
import {
  CentralInventoryListItem,
  CentralInventoryPayload,
  InventoryAdjustPayload,
  InventoryAllocationPayload,
  InventoryLedgerItem,
  InventoryLedgerSearchParams,
  InventoryLedgerSummaryItem,
  InventoryListItem,
  InventorySummaryItem,
  InventorySearchParams,
  InventoryTransferPayload,
} from "@/types/inventory";
import { storeService } from "./store.service";

type InventoryApiItem = {
  id: string;
  storeId: string;
  productId: string;
  allocatedWeight?: number;
  availableWeight?: number;
  allocatedStones?: number;
  soldWeight?: number;
  returnedWeight?: number;
  stoneWeight?: number;
  netGoldWeight?: number;
  createdAt?: string;
  updatedAt?: string;
  product?: {
    id: string;
    name?: string;
    sku?: string;
    category?: string;
  };
};

type InventoryListResponse = {
  success: boolean;
  data?: InventoryApiItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

const INVENTORY_BATCH_LIMIT = 100;

type CentralInventoryApiItem = {
  id: string;
  productId: string;
  totalWeight?: number;
  reservedWeight?: number;
  availableWeight?: number;
  totalStones?: number;
  reservedStones?: number;
  stoneWeight?: number;
  netGoldWeight?: number;
  updatedAt?: string;
  product?: {
    id: string;
    name?: string;
    sku?: string;
    category?: string;
    purity?: string;
    hsnCode?: string;
    makingChargeType?: "PER_GRAM" | "FIXED" | "PERCENTAGE";
    makingCharge?: number;
    gstRate?: number;
    isActive?: boolean;
  };
};

type CentralInventoryListResponse = {
  success: boolean;
  data?: CentralInventoryApiItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

type InventorySummaryApiItem = {
  store?: {
    id?: string;
    name?: string;
    code?: string;
  };
  totalAllocatedWeight?: number;
  totalSoldWeight?: number;
  totalAvailableWeight?: number;
  totalReturnedWeight?: number;
  productCount?: number;
};

type InventoryLedgerApiItem = {
  id: string;
  type: "ALLOCATION" | "SALE" | "REFUND" | "ADJUSTMENT";
  productId: string;
  fromStoreId?: string | null;
  toStoreId?: string | null;
  weight?: number;
  stoneCount?: number;
  stoneWeight?: number;
  netGoldWeight?: number;
  reference?: string;
  invoiceId?: string | null;
  refundId?: string | null;
  notes?: string | null;
  performedBy?: string;
  createdAt?: string;
};

type InventoryLedgerSummaryApiItem = {
  type: "ALLOCATION" | "SALE" | "REFUND" | "ADJUSTMENT";
  _sum?: {
    weight?: number | null;
    netGoldWeight?: number | null;
  };
  _count?: {
    id?: number;
  };
};

type InventorySummaryResponse = {
  success: boolean;
  data?: InventorySummaryApiItem[];
  message?: string;
};

type InventoryLedgerResponse = {
  success: boolean;
  data?: InventoryLedgerApiItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

type InventoryLedgerSummaryResponse = {
  success: boolean;
  data?: InventoryLedgerSummaryApiItem[];
  message?: string;
};

const normalizeInventoryItem = (
  item: InventoryApiItem,
  storeName: string,
): InventoryListItem => ({
  id: item.id,
  storeId: item.storeId,
  storeName,
  productId: item.productId,
  productName: item.product?.name ?? "Unnamed Product",
  productSku: item.product?.sku ?? "N/A",
  category: item.product?.category ?? "",
  quantityNumber: item.allocatedStones ?? 0,
  measuredQuantity: item.availableWeight ?? item.allocatedWeight ?? 0,
  measuredUnit: "carat",
  soldWeight: item.soldWeight ?? 0,
  returnedWeight: item.returnedWeight ?? 0,
  stoneWeight: item.stoneWeight ?? 0,
  updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
});

const normalizeCentralInventoryItem = (
  item: CentralInventoryApiItem,
): CentralInventoryListItem => ({
  id: item.id,
  productId: item.productId,
  productName: item.product?.name ?? "Unnamed Product",
  productSku: item.product?.sku ?? "N/A",
  category: item.product?.category ?? "",
  totalWeight: item.totalWeight ?? 0,
  availableWeight: item.availableWeight ?? 0,
  reservedWeight: item.reservedWeight ?? 0,
  totalStones: item.totalStones ?? 0,
  reservedStones: item.reservedStones ?? 0,
  stoneWeight: item.stoneWeight ?? 0,
  netGoldWeight: item.netGoldWeight ?? 0,
  updatedAt: item.updatedAt ?? new Date().toISOString(),
});

const normalizeInventorySummary = (
  item: InventorySummaryApiItem,
): InventorySummaryItem => ({
  store: {
    id: item.store?.id ?? "",
    name: item.store?.name ?? "Store",
    code: item.store?.code ?? "N/A",
  },
  totalAllocatedWeight: item.totalAllocatedWeight ?? 0,
  totalSoldWeight: item.totalSoldWeight ?? 0,
  totalAvailableWeight: item.totalAvailableWeight ?? 0,
  totalReturnedWeight: item.totalReturnedWeight ?? 0,
  productCount: item.productCount ?? 0,
});

const normalizeLedgerItem = (item: InventoryLedgerApiItem): InventoryLedgerItem => ({
  id: item.id,
  type: item.type,
  productId: item.productId,
  fromStoreId: item.fromStoreId ?? null,
  toStoreId: item.toStoreId ?? null,
  weight: item.weight ?? 0,
  stoneCount: item.stoneCount ?? 0,
  stoneWeight: item.stoneWeight ?? 0,
  netGoldWeight: item.netGoldWeight ?? 0,
  reference: item.reference ?? "N/A",
  invoiceId: item.invoiceId ?? null,
  refundId: item.refundId ?? null,
  notes: item.notes ?? null,
  performedBy: item.performedBy ?? "",
  createdAt: item.createdAt ?? new Date().toISOString(),
});

const normalizeLedgerSummaryItem = (
  item: InventoryLedgerSummaryApiItem,
): InventoryLedgerSummaryItem => ({
  type: item.type,
  totalWeight: item._sum?.weight ?? 0,
  totalNetGoldWeight: item._sum?.netGoldWeight ?? 0,
  count: item._count?.id ?? 0,
});

const sortInventory = (
  rows: InventoryListItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (sortBy === "productName") {
      return a.productName.localeCompare(b.productName) * multiplier;
    }

    if (sortBy === "quantityNumber") {
      return (a.quantityNumber - b.quantityNumber) * multiplier;
    }

    if (sortBy === "storeName") {
      return a.storeName.localeCompare(b.storeName) * multiplier;
    }

    return a.updatedAt.localeCompare(b.updatedAt) * multiplier;
  });
};

const filterInventory = (rows: InventoryListItem[], params?: InventorySearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  return rows.filter((item) => {
    const matchesSearch = !search
      ? true
      : item.productName.toLowerCase().includes(search) ||
        item.productSku.toLowerCase().includes(search) ||
        item.storeName.toLowerCase().includes(search);

    const matchesStore = params?.storeId ? item.storeId === params.storeId : true;
    const matchesCategory = params?.category ? item.category === params.category : true;

    return matchesSearch && matchesStore && matchesCategory;
  });
};

const buildPaginatedResponse = (
  rows: InventoryListItem[],
  page = 1,
  limit = 10,
  total = rows.length,
): PaginatedResponse<InventoryListItem> => ({
  success: true,
  data: rows,
  page,
  limit,
  total,
});

export const inventoryService = {
  getCentralInventory: async (page = 1, limit = 10) => {
    const res = (await getService(
      `${endpoints.inventory.central}?page=${page}&limit=${limit}`,
    )) as CentralInventoryListResponse;

    const rows: CentralInventoryListItem[] = (res.data ?? []).map(normalizeCentralInventoryItem);

    return {
      success: res.success,
      data: rows,
      page: res.pagination?.page ?? page,
      limit: res.pagination?.limit ?? limit,
      total: res.pagination?.total ?? rows.length,
      message: res.message,
    };
  },

  getCentralProducts: async () => {
    const res = (await getService(
      `${endpoints.inventory.central}?page=1&limit=${INVENTORY_BATCH_LIMIT}`,
    )) as CentralInventoryListResponse;

    return (res.data ?? [])
      .filter((item) => (item.availableWeight ?? 0) > 0 && item.product?.id)
      .map((item) => ({
        id: item.product?.id ?? item.productId,
        sku: item.product?.sku ?? "N/A",
        name: item.product?.name ?? "Unnamed Product",
        category: item.product?.category ?? "",
        purity: item.product?.purity ?? "",
        hsnCode: item.product?.hsnCode ?? "",
        makingChargeType: item.product?.makingChargeType,
        makingCharge: item.product?.makingCharge,
        gstRate: item.product?.gstRate,
        isActive:
          typeof item.product?.isActive === "boolean"
            ? item.product.isActive
            : true,
        availableWeight: item.availableWeight ?? 0,
        totalStones: item.totalStones ?? 0,
      }));
  },

  getCentralInventoryByProduct: async (productId: string) => {
    const res = (await getService(
      endpoints.inventory.centralByProduct(productId),
    )) as {
      success: boolean;
      data?: CentralInventoryApiItem;
      message?: string;
    };

    if (!res.data) {
      throw new Error("Central inventory details not found.");
    }

    return {
      ...res,
      data: normalizeCentralInventoryItem(res.data),
    };
  },

  getAll: async (params?: InventorySearchParams) => {
    if (params?.storeId) {
      const query = new URLSearchParams({
        page: String(params.page ?? 1),
        limit: String(params.limit ?? 10),
      });

      const store =
        storeService.getOptions().find((item) => item.id === params.storeId) ??
        (await storeService.getById(params.storeId).then((res) => res.data).catch(() => null));

      const res = (await getService(
        `${endpoints.inventory.byStore(params.storeId)}?${query.toString()}`,
      )) as InventoryListResponse;

      const rows = sortInventory(
        (res.data ?? []).map((item) =>
          normalizeInventoryItem(item, store?.name ?? "Store"),
        ),
        params?.sortBy,
        params?.sortOrder,
      );

      return buildPaginatedResponse(
        rows,
        res.pagination?.page ?? params?.page ?? 1,
        res.pagination?.limit ?? params?.limit ?? 10,
        res.pagination?.total ?? rows.length,
      );
    }

    const stores = await storeService.search({
      page: 1,
      limit: INVENTORY_BATCH_LIMIT,
    });
    const activeStores = stores.data;

    const inventoryByStore = await Promise.all(
      activeStores.map(async (store) => {
        const res = (await getService(
          `${endpoints.inventory.byStore(store.id)}?page=1&limit=${INVENTORY_BATCH_LIMIT}`,
        )) as InventoryListResponse;

        return (res.data ?? []).map((item) => normalizeInventoryItem(item, store.name));
      }),
    );

    const flattened = inventoryByStore.flat();
    const filtered = sortInventory(filterInventory(flattened, params), params?.sortBy, params?.sortOrder);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const startIndex = (page - 1) * limit;

    return buildPaginatedResponse(
      filtered.slice(startIndex, startIndex + limit),
      page,
      limit,
      filtered.length,
    );
  },

  allocate: (payload: InventoryAllocationPayload) =>
    postService(endpoints.inventory.allocate, payload),

  adjustCentralStock: (productId: string, payload: InventoryAdjustPayload) =>
    patchService(endpoints.inventory.adjust(productId), payload),

  transfer: (payload: InventoryTransferPayload) =>
    postService(endpoints.inventory.transfer, payload),

  getSummary: async () => {
    const res = (await getService(endpoints.inventory.summary)) as InventorySummaryResponse;

    return {
      ...res,
      data: (res.data ?? []).map(normalizeInventorySummary),
    };
  },

  getLedger: async (params?: InventoryLedgerSearchParams) => {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.limit ?? 10),
    });

    if (params?.type) query.set("type", params.type);
    if (params?.productId) query.set("productId", params.productId);
    if (params?.storeId) query.set("storeId", params.storeId);
    if (params?.fromDate) query.set("fromDate", params.fromDate);
    if (params?.toDate) query.set("toDate", params.toDate);

    const res = (await getService(
      `${endpoints.inventory.ledger}?${query.toString()}`,
    )) as InventoryLedgerResponse;

    return {
      success: res.success,
      data: (res.data ?? []).map(normalizeLedgerItem),
      page: res.pagination?.page ?? params?.page ?? 1,
      limit: res.pagination?.limit ?? params?.limit ?? 10,
      total: res.pagination?.total ?? (res.data ?? []).length,
      message: res.message,
    };
  },

  getLedgerSummary: async (productId?: string) => {
    const query = productId ? `?productId=${encodeURIComponent(productId)}` : "";
    const res = (await getService(
      `${endpoints.inventory.ledgerSummary}${query}`,
    )) as InventoryLedgerSummaryResponse;

    return {
      ...res,
      data: (res.data ?? []).map(normalizeLedgerSummaryItem),
    };
  },

  receiveCentralStock: (payload: CentralInventoryPayload) =>
    postService(endpoints.inventory.central, payload),
};
