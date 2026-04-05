import {
  getService,
  postService,
  patchService,
  deleteService,
} from "./service";
import endpoints from "@/constants/query_const";
import { ProductSearchParams } from "@/types/product";
import { PaginatedResponse } from "@/types";
import { ProductFormValues } from "@/schemas/product.schema";
import { ProductListItem } from "@/types/product";

type ProductApiItem = ProductListItem;

type ProductListResponse = {
  success: boolean;
  data?: ProductApiItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

type ProductSingleResponse = {
  success: boolean;
  data?: ProductApiItem;
  message?: string;
};

const normalizeProduct = (product: ProductApiItem): ProductListItem => ({
  id: product.id,
  sku: product.sku ?? "N/A",
  name: product.name ?? "Unnamed Product",
  category: product.category ?? "",
  purity: product.purity ?? "",
  hsnCode: product.hsnCode ?? "",
  makingChargeType: product.makingChargeType,
  makingCharge: product.makingCharge,
  gstRate: product.gstRate,
  isActive:
    typeof product.isActive === "boolean"
      ? product.isActive
      : typeof product.active === "boolean"
        ? product.active
        : true,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const buildProductsQuery = (params?: ProductSearchParams) => {
  const query = new URLSearchParams();

  if (params?.page) {
    query.set("page", String(params.page));
  }

  if (params?.limit) {
    query.set("limit", String(params.limit));
  }

  if (params?.category) {
    query.set("category", params.category);
  }

  if (params?.purity) {
    query.set("purity", params.purity);
  }

  if (typeof params?.isActive === "boolean") {
    query.set("isActive", String(params.isActive));
  }

  if (params?.sortBy) {
    query.set("sortBy", params.sortBy);
  }

  if (params?.sortOrder) {
    query.set("sortOrder", params.sortOrder);
  }

  if (params?.sortBy && params?.sortOrder) {
    query.set("sort", `${params.sortBy}:${params.sortOrder}`);
  }

  return query.toString();
};

export const productService = {
  getAll: async (params?: ProductSearchParams): Promise<PaginatedResponse<ProductListItem>> => {
    const query = buildProductsQuery(params);
    const endPoint = query
      ? `${endpoints.products.getAll}?${query}`
      : endpoints.products.getAll;

    const res = (await getService(endPoint)) as ProductListResponse;
    const rows = (res.data ?? []).map(normalizeProduct);

    return {
      success: res.success,
      data: rows,
      page: res.pagination?.page ?? params?.page ?? 1,
      limit: res.pagination?.limit ?? params?.limit ?? 10,
      total: res.pagination?.total ?? rows.length,
      message: res.message,
    };
  },

  search: async (params: ProductSearchParams) => {
    const query = buildProductsQuery(params);
    const searchQuery = new URLSearchParams(query);

    if (params.search) {
      searchQuery.set("q", params.search);
    }

    const endPoint = `${endpoints.products.search}?${searchQuery.toString()}`;
    const res = (await getService(endPoint)) as ProductListResponse | { success: boolean; data?: ProductApiItem[]; message?: string };
    const rows = (res.data ?? []).map(normalizeProduct);

    return {
      success: res.success,
      data: rows,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      total: rows.length,
      message: res.message,
    } satisfies PaginatedResponse<ProductListItem>;
  },

  getById: async (id: string) => {
    const res = (await getService(endpoints.products.getById(id))) as ProductSingleResponse;

    if (!res.data) {
      throw new Error("Product details not found.");
    }

    return {
      ...res,
      data: normalizeProduct(res.data),
    };
  },

  create: async (data: ProductFormValues) => {
    const payload = {
      ...data,
      sku: data.sku?.trim() || undefined,
    };

    const res = (await postService(endpoints.products.create, payload)) as ProductSingleResponse;
    return {
      ...res,
      data: res.data ? normalizeProduct(res.data) : undefined,
    };
  },

  update: async (id: string, data: Partial<ProductFormValues>) => {
    const payload = {
      ...data,
      sku: data.sku?.trim() || undefined,
    };

    const res = (await patchService(endpoints.products.update(id), payload, {})) as ProductSingleResponse;
    return {
      ...res,
      data: res.data ? normalizeProduct(res.data) : undefined,
    };
  },

  delete: (id: string) =>
    deleteService(endpoints.products.delete(id), {}),

  activate: (id: string) =>
    patchService(endpoints.products.activate(id), {}, {}),
};
