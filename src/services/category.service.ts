import { getService, patchService, postService, deleteService } from "./service";
import endpoints from "@/constants/query_const";
import { PaginatedResponse } from "@/types";
import { CategorySearchParams, CategoryListItem } from "@/types/category";
import { CategoryFormValues } from "@/schemas/category.schema";

type CategoryApiItem = {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryListResponse = {
  success: boolean;
  data?: CategoryApiItem[];
  message?: string;
};

type CategorySingleResponse = {
  success: boolean;
  data?: CategoryApiItem;
  message?: string;
};

const normalizeActive = (item: CategoryListItem) => {
  if (typeof item.isActive === "boolean") return item.isActive;
  if (typeof item.active === "boolean") return item.active;
  if (typeof item.status === "string") return item.status.toUpperCase() === "ACTIVE";
  return true;
};

const normalizeCategory = (item: CategoryApiItem): CategoryListItem => ({
  id: item.id,
  name: item.name ?? "Unnamed Category",
  description: item.description ?? "",
  isActive: item.isActive ?? true,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const sortCategories = (
  categories: CategoryListItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...categories].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    );
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;

  return [...categories].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name) * multiplier;
    }

    return (a.createdAt ?? "").localeCompare(b.createdAt ?? "") * -1;
  });
};

const buildPaginatedResponse = (
  rows: CategoryListItem[],
  page = 1,
  limit = 10,
): PaginatedResponse<CategoryListItem> => {
  const total = rows.length;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const startIndex = (safePage - 1) * safeLimit;
  const data = rows.slice(startIndex, startIndex + safeLimit);

  return {
    success: true,
    data,
    total,
    page: safePage,
    limit: safeLimit,
  };
};

const filterCategories = (
  rows: CategoryListItem[],
  params?: CategorySearchParams,
) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  const filtered = rows.filter((item) => {
    const matchesSearch = !search
      ? true
      : item.name.toLowerCase().includes(search) ||
        (item.description ?? "").toLowerCase().includes(search);

    const matchesStatus =
      typeof params?.isActive === "boolean"
        ? normalizeActive(item) === params.isActive
        : true;

    return matchesSearch && matchesStatus;
  });

  return sortCategories(filtered, params?.sortBy, params?.sortOrder);
};

export const categoryService = {
  getAll: async (params?: CategorySearchParams) => {
    const query = new URLSearchParams();

    if (typeof params?.includeInactive === "boolean") {
      query.set("includeInactive", String(params.includeInactive));
    } else if (typeof params?.isActive === "boolean") {
      query.set("includeInactive", String(!params.isActive));
    }

    const endpoint = query.toString()
      ? `${endpoints.categories.getAll}?${query.toString()}`
      : endpoints.categories.getAll;
    const res = (await getService(endpoint)) as CategoryListResponse;
    const rows = filterCategories((res.data ?? []).map(normalizeCategory), params);

    return buildPaginatedResponse(rows, params?.page, params?.limit);
  },

  search: async (params: CategorySearchParams) => {
    const res = await categoryService.getAll({
      ...params,
      includeInactive:
        typeof params.isActive === "boolean" ? !params.isActive : true,
      page: 1,
      limit: 999,
    });
    const rows = filterCategories(res.data, params);
    return buildPaginatedResponse(rows, params.page, params.limit);
  },

  create: async (data: CategoryFormValues) => {
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
    };
    const res = (await postService(endpoints.categories.create, payload)) as CategorySingleResponse;
    return {
      ...res,
      data: res.data ? normalizeCategory(res.data) : undefined,
    };
  },

  update: async (id: string, data: Partial<CategoryFormValues> & { isActive?: boolean }) => {
    const payload = {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined
        ? { description: data.description.trim() || undefined }
        : {}),
      ...(typeof data.isActive === "boolean" ? { isActive: data.isActive } : {}),
    };
    const res = (await patchService(endpoints.categories.update(id), payload)) as CategorySingleResponse;
    return {
      ...res,
      data: res.data ? normalizeCategory(res.data) : undefined,
    };
  },

  delete: async (id: string) => {
    const res = (await deleteService(endpoints.categories.delete(id))) as CategorySingleResponse;
    return {
      ...res,
      data: res.data ? normalizeCategory(res.data) : undefined,
    };
  },

  activate: async (id: string) => categoryService.update(id, { isActive: true }),
};
