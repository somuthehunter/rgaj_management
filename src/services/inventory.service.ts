import { getService, postService } from "./service";
import endpoints from "@/constants/query_const";
import { PaginatedResponse } from "@/types";
import {
  InventoryAllocationPayload,
  CentralInventoryPayload,
  InventoryListItem,
  InventorySearchParams,
} from "@/types/inventory";
import { storeService } from "./store.service";

type InventoryApiItem = {
  id: string;
  storeId: string;
  productId: string;
  allocatedWeight?: number;
  availableWeight?: number;
  allocatedStones?: number;
  stoneWeight?: number;
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
  availableWeight?: number;
  totalStones?: number;
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

export type CentralInventoryListItem = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  totalWeight: number;
  availableWeight: number;
  totalStones: number;
  updatedAt: string;
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
  updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
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

    const rows: CentralInventoryListItem[] = (res.data ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name ?? "Unnamed Product",
      productSku: item.product?.sku ?? "N/A",
      category: item.product?.category ?? "",
      totalWeight: item.totalWeight ?? 0,
      availableWeight: item.availableWeight ?? 0,
      totalStones: item.totalStones ?? 0,
      updatedAt: new Date().toISOString(),
    }));

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

  receiveCentralStock: (payload: CentralInventoryPayload) =>
    postService(endpoints.inventory.central, payload),
};
