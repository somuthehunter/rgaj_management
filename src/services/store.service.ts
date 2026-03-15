import {
  getService,
  postService,
  patchService,
  deleteService,
} from "./service";
import endpoints from "@/constants/query_const";

export const storeService = {
  getAll: () => getService(endpoints.stores.getAll),

  getById: (id: string) =>
    getService(endpoints.stores.getById(id)),

  create: (data: object) =>
    postService(endpoints.stores.create, data),

  update: (id: string, data: object) =>
    patchService(endpoints.stores.update(id), data, {}),

  delete: (id: string) =>
    deleteService(endpoints.stores.delete(id), {}),
};