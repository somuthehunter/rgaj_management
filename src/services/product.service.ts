import {
  getService,
  postService,
  patchService,
  deleteService,
} from "./service";
import endpoints from "@/constants/query_const";
import { ProductSearchParams } from "@/types/product";

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
  getAll: (params?: ProductSearchParams) => {
    const query = buildProductsQuery(params);
    const endPoint = query
      ? `${endpoints.products.getAll}?${query}`
      : endpoints.products.getAll;

    return getService(endPoint);
  },

  search: (params: ProductSearchParams) => {
    const query = buildProductsQuery(params);
    const searchQuery = new URLSearchParams(query);

    if (params.search) {
      searchQuery.set("q", params.search);
    }

    const endPoint = `${endpoints.products.search}?${searchQuery.toString()}`;
    return getService(endPoint);
  },

  create: (data: object) =>
    postService(endpoints.products.create, data),

  update: (id: string, data: object) =>
    patchService(endpoints.products.update(id), data, {}),

  delete: (id: string) =>
    deleteService(endpoints.products.delete(id), {}),

  activate: (id: string) =>
    patchService(endpoints.products.activate(id), {}, {}),

  returnToAdmin: (id: string, qty: number) =>
    patchService(endpoints.products.returnToAdmin(id), { qty }, {}),
};
