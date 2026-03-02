import {
  getService,
  postService,
  patchService,
  deleteService,
} from "./service";
import endpoints from "@/constants/query_const";

export const productService = {
  getAll: () => getService(endpoints.products.getAll),

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
