import {
  getService,
  postService,
  patchService,
  deleteService,
} from "./service";
import endpoints from "@/constants/query_const";
import { ProductSearchParams } from "@/types/product";

export const productService = {
  getAll: () => getService(endpoints.products.getAll),

  search: (params: ProductSearchParams) => {
    const query = new URLSearchParams();

    if (params.search) {
      query.set("query", params.search);
      query.set("q", params.search);
    }

    if (params.category) {
      query.set("category", params.category);
    }

    if (params.status === "active") {
      query.set("isActive", "true");
      query.set("status", "ACTIVE");
    }

    if (params.status === "deactivated") {
      query.set("isActive", "false");
      query.set("status", "INACTIVE");
    }

    if (params.sortBy) {
      query.set("sortBy", params.sortBy);
    }

    if (params.sortOrder) {
      query.set("sortOrder", params.sortOrder);
    }

    if (params.sortBy && params.sortOrder) {
      query.set("sort", `${params.sortBy}:${params.sortOrder}`);
    }

    const q = query.toString();
    const endPoint = q
      ? `${endpoints.products.search}?${q}`
      : endpoints.products.search;

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
