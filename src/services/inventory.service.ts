import { PaginatedResponse, Store } from "@/types";
import { InventoryListItem, InventorySearchParams } from "@/types/inventory";

export const mockInventoryStores: Store[] = [
  {
    id: "store-1",
    name: "Main Showroom",
    location: "Kolkata",
    managerId: "mgr-1",
    managerName: "Amit Roy",
    createdAt: "2026-03-01T10:00:00.000Z",
    productCount: 42,
  },
  {
    id: "store-2",
    name: "City Branch",
    location: "Durgapur",
    managerId: "mgr-2",
    managerName: "Priya Das",
    createdAt: "2026-03-02T10:00:00.000Z",
    productCount: 28,
  },
  {
    id: "store-3",
    name: "Mall Branch",
    location: "Siliguri",
    managerId: "mgr-3",
    managerName: "Rohan Sen",
    createdAt: "2026-03-03T10:00:00.000Z",
    productCount: 17,
  },
];

const mockInventory: InventoryListItem[] = [
  {
    id: "inv-1",
    storeId: "store-1",
    storeName: "Main Showroom",
    productId: "prod-1",
    productName: "Diamond Earrings 28K",
    productSku: "EARR-28K-71534",
    category: "Diamond Collection",
    quantityNumber: 8,
    measuredQuantity: 6.5,
    measuredUnit: "carat",
    updatedAt: "2026-03-15T09:00:00.000Z",
  },
  {
    id: "inv-2",
    storeId: "store-2",
    storeName: "City Branch",
    productId: "prod-2",
    productName: "Gold Necklace 22K Traditional",
    productSku: "NECK-22K-001",
    category: "Gold Jewellery",
    quantityNumber: 5,
    measuredQuantity: 18,
    measuredUnit: "ratti",
    updatedAt: "2026-03-15T09:15:00.000Z",
  },
  {
    id: "inv-3",
    storeId: "store-3",
    storeName: "Mall Branch",
    productId: "prod-3",
    productName: "Gold Bangles 22K Pair",
    productSku: "BANG-22K-001",
    category: "Gold Jewellery",
    quantityNumber: 11,
    measuredQuantity: 24,
    measuredUnit: "ratti",
    updatedAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "inv-4",
    storeId: "store-1",
    storeName: "Main Showroom",
    productId: "prod-4",
    productName: "Silver Anklet Premium",
    productSku: "SIL-ANK-004",
    category: "Silver Jewellery",
    quantityNumber: 14,
    measuredQuantity: 9.25,
    measuredUnit: "carat",
    updatedAt: "2026-03-15T10:20:00.000Z",
  },
  {
    id: "inv-5",
    storeId: "store-2",
    storeName: "City Branch",
    productId: "prod-5",
    productName: "Kids Bracelet",
    productSku: "KID-BRC-002",
    category: "Kids Collection",
    quantityNumber: 19,
    measuredQuantity: 7,
    measuredUnit: "ratti",
    updatedAt: "2026-03-15T11:00:00.000Z",
  },
  {
    id: "inv-6",
    storeId: "store-3",
    storeName: "Mall Branch",
    productId: "prod-6",
    productName: "Wedding Choker Set",
    productSku: "WED-CHK-008",
    category: "Wedding Specials",
    quantityNumber: 3,
    measuredQuantity: 14.5,
    measuredUnit: "carat",
    updatedAt: "2026-03-15T11:30:00.000Z",
  },
];

const delay = async () =>
  new Promise((resolve) => window.setTimeout(resolve, 100));

const buildPaginatedResponse = (
  rows: InventoryListItem[],
  page = 1,
  limit = 10,
): PaginatedResponse<InventoryListItem> => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const total = rows.length;
  const startIndex = (safePage - 1) * safeLimit;

  return {
    success: true,
    data: rows.slice(startIndex, startIndex + safeLimit),
    total,
    page: safePage,
    limit: safeLimit,
  };
};

const filterInventory = (params?: InventorySearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  const rows = mockInventory.filter((item) => {
    const matchesSearch = !search
      ? true
      : item.productName.toLowerCase().includes(search) ||
        item.productSku.toLowerCase().includes(search) ||
        item.storeName.toLowerCase().includes(search);

    const matchesStore = params?.storeId ? item.storeId === params.storeId : true;
    const matchesCategory = params?.category
      ? item.category === params.category
      : true;

    return matchesSearch && matchesStore && matchesCategory;
  });

  const sortBy = params?.sortBy;
  const sortOrder = params?.sortOrder ?? "";

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

    return b.updatedAt.localeCompare(a.updatedAt);
  });
};

export const inventoryService = {
  // Replace this mock implementation with real inventory API calls later.
  getAll: async (params?: InventorySearchParams) => {
    await delay();
    const rows = filterInventory(params);
    return buildPaginatedResponse(rows, params?.page, params?.limit);
  },
};
