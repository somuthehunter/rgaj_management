import {
  deleteService,
  getService,
  patchService,
  postService,
} from "./service";
import endpoints from "@/constants/query_const";
import { StoreFormValues } from "@/schemas/store.schema";
import { PaginatedResponse } from "@/types";
import { StoreListItem, StoreSearchParams } from "@/types/store";

type JsonObject = Record<string, unknown>;

type StoreApiItem = {
  id: string;
  code?: string | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    users?: number;
  };
  users?: Array<{
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
  }>;
};

type StoreListResponse = {
  success: boolean;
  data?: StoreApiItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

let storeOptionsCache: StoreListItem[] = [];

const normalizeStore = (store: StoreApiItem): StoreListItem => ({
  id: store.id,
  code: store.code ?? "N/A",
  name: store.name ?? "Unnamed Store",
  address: store.address ?? "",
  city: store.city ?? "",
  state: store.state ?? "",
  phone: store.phone ?? "",
  isActive: typeof store.isActive === "boolean" ? store.isActive : true,
  createdAt: store.createdAt,
  updatedAt: store.updatedAt,
  userCount: store._count?.users ?? store.users?.length ?? 0,
});

const sortStores = (
  rows: StoreListItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...rows];
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
  total = rows.length,
): PaginatedResponse<StoreListItem> => ({
  success: true,
  data: rows,
  total,
  page,
  limit,
});

const updateOptionsCache = (stores: StoreListItem[]) => {
  storeOptionsCache = stores;
};

const buildStoresQuery = (params?: StoreSearchParams, overrideLimit?: number) => {
  const query = new URLSearchParams();

  query.set("page", String(overrideLimit ? 1 : params?.page ?? 1));
  query.set("limit", String(overrideLimit ?? params?.limit ?? 10));

  if (typeof params?.isActive === "boolean") {
    query.set("isActive", String(params.isActive));
  }

  return query.toString();
};

const filterStores = (rows: StoreListItem[], params?: StoreSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  return rows.filter((item) => {
    if (!search) return true;

    return (
      item.name.toLowerCase().includes(search) ||
      item.code.toLowerCase().includes(search) ||
      item.city.toLowerCase().includes(search)
    );
  });
};

export const storeService = {
  getAll: async (params?: StoreSearchParams) => {
    const query = buildStoresQuery(params);
    const res = (await getService(
      `${endpoints.stores.getAll}?${query}`,
    )) as StoreListResponse;

    const rows = (res.data ?? []).map(normalizeStore);
    updateOptionsCache(rows);

    return buildPaginatedResponse(
      sortStores(rows, params?.sortBy, params?.sortOrder),
      res.pagination?.page ?? params?.page ?? 1,
      res.pagination?.limit ?? params?.limit ?? 10,
      res.pagination?.total ?? rows.length,
    );
  },

  search: async (params: StoreSearchParams) => {
    const query = buildStoresQuery(params, 500);
    const res = (await getService(
      `${endpoints.stores.getAll}?${query}`,
    )) as StoreListResponse;

    const rows = (res.data ?? []).map(normalizeStore);
    const filtered = sortStores(filterStores(rows, params), params.sortBy, params.sortOrder);
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const startIndex = (page - 1) * limit;
    const paginatedRows = filtered.slice(startIndex, startIndex + limit);

    updateOptionsCache(rows);

    return buildPaginatedResponse(paginatedRows, page, limit, filtered.length);
  },

  getById: async (id: string) => {
    const res = (await getService(endpoints.stores.getById(id))) as {
      success: boolean;
      data?: StoreApiItem;
      message?: string;
    };

    if (!res.data) {
      throw new Error("Store details not found.");
    }

    return {
      ...res,
      data: {
        ...normalizeStore(res.data),
        users:
          res.data.users?.map((user) => ({
            id: user.id,
            name: [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email || "Unknown user",
            email: user.email ?? "",
            role: user.role ?? "",
            isActive: user.isActive ?? true,
          })) ?? [],
      },
    };
  },

  create: async (data: StoreFormValues) => {
    const payload = {
      ...data,
      code: data.code?.trim() || undefined,
    };

    const res = (await postService(endpoints.stores.create, payload)) as {
      success: boolean;
      data?: StoreApiItem;
      message?: string;
    };

    if (res.data) {
      updateOptionsCache([normalizeStore(res.data), ...storeOptionsCache]);
    }

    return {
      ...res,
      data: res.data ? normalizeStore(res.data) : undefined,
    };
  },

  update: async (id: string, data: Partial<StoreFormValues>) => {
    const payload = {
      ...data,
      code: data.code?.trim() || undefined,
    };

    const res = (await patchService(endpoints.stores.update(id), payload)) as {
      success: boolean;
      data?: StoreApiItem;
      message?: string;
    };

    if (res.data) {
      const normalized = normalizeStore(res.data);
      updateOptionsCache(
        storeOptionsCache.map((store) => (store.id === id ? normalized : store)),
      );
    }

    return {
      ...res,
      data: res.data ? normalizeStore(res.data) : undefined,
    };
  },

  delete: async (id: string) => {
    const res = (await deleteService(endpoints.stores.delete(id))) as {
      success: boolean;
      data?: JsonObject | null;
      message?: string;
    };

    updateOptionsCache(
      storeOptionsCache.map((store) =>
        store.id === id ? { ...store, isActive: false } : store,
      ),
    );

    return res;
  },

  activate: async (id: string) => {
    const res = (await patchService(endpoints.stores.activate(id), {})) as {
      success: boolean;
      data?: JsonObject | null;
      message?: string;
    };

    updateOptionsCache(
      storeOptionsCache.map((store) =>
        store.id === id ? { ...store, isActive: true } : store,
      ),
    );

    return res;
  },

  getStats: (id: string) => getService(endpoints.stores.stats(id)),

  getOptions: () => storeOptionsCache.filter((store) => store.isActive !== false),
};
