import { PaginatedResponse } from "@/types";
import { StoreListItem, StoreSearchParams } from "@/types/store";
import { StoreFormValues } from "@/schemas/store.schema";

let mockStores: StoreListItem[] = [
  {
    id: "store-1",
    code: "RGAJ-MAIN",
    name: "Main Showroom",
    address: "12 Park Street",
    city: "Kolkata",
    state: "West Bengal",
    phone: "+91 9876540001",
    managerName: "Sourav Admin",
    userCount: 4,
    isActive: true,
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "store-2",
    code: "RGAJ-CITY",
    name: "City Branch",
    address: "45 Benachity",
    city: "Durgapur",
    state: "West Bengal",
    phone: "+91 9876540002",
    managerName: "Priya Manager",
    userCount: 3,
    isActive: true,
    createdAt: "2026-03-03T10:00:00.000Z",
  },
  {
    id: "store-3",
    code: "RGAJ-MALL",
    name: "Mall Branch",
    address: "City Centre Mall Road",
    city: "Siliguri",
    state: "West Bengal",
    phone: "+91 9876540003",
    managerName: "Rohan Sen",
    userCount: 2,
    isActive: false,
    createdAt: "2026-03-05T10:00:00.000Z",
    deactivatedAt: "2026-03-20T08:00:00.000Z",
  },
];

const delay = async () =>
  new Promise((resolve) => window.setTimeout(resolve, 120));

const normalizeActive = (item: StoreListItem) => {
  if (typeof item.isActive === "boolean") return item.isActive;
  if (typeof item.status === "string") return item.status.toUpperCase() === "ACTIVE";
  if (item.deactivatedAt) return false;
  return true;
};

const sortStores = (
  rows: StoreListItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...rows].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    );
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name) * multiplier;
    }

    if (sortBy === "city") {
      return a.city.localeCompare(b.city) * multiplier;
    }

    if (sortBy === "userCount") {
      return (a.userCount - b.userCount) * multiplier;
    }

    return (a.createdAt ?? "").localeCompare(b.createdAt ?? "") * multiplier;
  });
};

const buildPaginatedResponse = (
  rows: StoreListItem[],
  page = 1,
  limit = 10,
): PaginatedResponse<StoreListItem> => {
  const total = rows.length;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const startIndex = (safePage - 1) * safeLimit;

  return {
    success: true,
    data: rows.slice(startIndex, startIndex + safeLimit),
    total,
    page: safePage,
    limit: safeLimit,
  };
};

const filterStores = (params?: StoreSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  const filtered = mockStores.filter((item) => {
    const matchesSearch = !search
      ? true
      : item.name.toLowerCase().includes(search) ||
        item.code.toLowerCase().includes(search) ||
        item.city.toLowerCase().includes(search);

    const matchesStatus =
      typeof params?.isActive === "boolean"
        ? normalizeActive(item) === params.isActive
        : true;

    return matchesSearch && matchesStatus;
  });

  return sortStores(filtered, params?.sortBy, params?.sortOrder);
};

export const storeService = {
  // Replace this mock implementation with real store API calls when the backend is ready.
  getAll: async (params?: StoreSearchParams) => {
    await delay();
    const rows = filterStores(params);
    return buildPaginatedResponse(rows, params?.page, params?.limit);
  },

  search: async (params: StoreSearchParams) => {
    await delay();
    const rows = filterStores(params);
    return buildPaginatedResponse(rows, params.page, params.limit);
  },

  create: async (data: StoreFormValues) => {
    await delay();
    const nextStore: StoreListItem = {
      id: `store-${Date.now()}`,
      ...data,
      userCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockStores = [nextStore, ...mockStores];

    return {
      success: true,
      data: nextStore,
      message: "Store created.",
    };
  },

  update: async (id: string, data: StoreFormValues) => {
    await delay();
    let updatedStore: StoreListItem | null = null;

    mockStores = mockStores.map((item) => {
      if (item.id !== id) return item;

      updatedStore = {
        ...item,
        ...data,
      };

      return updatedStore;
    });

    return {
      success: true,
      data: updatedStore,
      message: "Store updated.",
    };
  },

  delete: async (id: string) => {
    await delay();
    mockStores = mockStores.map((item) =>
      item.id === id
        ? { ...item, isActive: false, deactivatedAt: new Date().toISOString() }
        : item,
    );

    return {
      success: true,
      data: true,
      message: "Store deactivated.",
    };
  },

  activate: async (id: string) => {
    await delay();
    mockStores = mockStores.map((item) =>
      item.id === id
        ? { ...item, isActive: true, deactivatedAt: undefined }
        : item,
    );

    return {
      success: true,
      data: true,
      message: "Store activated.",
    };
  },

  getOptions: () => mockStores.filter((store) => normalizeActive(store)),
};
