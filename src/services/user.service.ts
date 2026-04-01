import {
  deleteService,
  getService,
  patchService,
  postService,
} from "./service";
import { UserRole, PaginatedResponse } from "@/types";
import { UserFormValues } from "@/schemas/user.schema";
import { UserListItem, UserSearchParams } from "@/types/user";
import endpoints from "@/constants/query_const";

type UserApiItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  storeId?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  store?: {
    id: string;
    name: string;
  } | null;
};

type UserListResponse = {
  success: boolean;
  data?: UserApiItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

const USER_BATCH_LIMIT = 100;

const normalizeUser = (user: UserApiItem): UserListItem => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  name: [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
  role: user.role,
  storeId: user.storeId ?? null,
  storeName: user.store?.name,
  isActive: typeof user.isActive === "boolean" ? user.isActive : true,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const sortUsers = (
  rows: UserListItem[],
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

    if (sortBy === "email") {
      return a.email.localeCompare(b.email) * multiplier;
    }

    if (sortBy === "role") {
      return a.role.localeCompare(b.role) * multiplier;
    }

    return (a.createdAt ?? "").localeCompare(b.createdAt ?? "") * multiplier;
  });
};

const buildPaginatedResponse = (
  rows: UserListItem[],
  page = 1,
  limit = 10,
  total = rows.length,
): PaginatedResponse<UserListItem> => ({
  success: true,
  data: rows,
  total,
  page,
  limit,
});

const buildUsersQuery = (params?: UserSearchParams, overrideLimit?: number) => {
  const query = new URLSearchParams();

  query.set("page", String(overrideLimit ? 1 : params?.page ?? 1));
  query.set("limit", String(overrideLimit ?? params?.limit ?? 10));

  if (params?.role) {
    query.set("role", params.role);
  }

  if (params?.storeId) {
    query.set("storeId", params.storeId);
  }

  if (typeof params?.isActive === "boolean") {
    query.set("isActive", String(params.isActive));
  }

  return query.toString();
};

const filterUsers = (rows: UserListItem[], params?: UserSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  return rows.filter((item) => {
    if (!search) return true;

    return (
      item.name.toLowerCase().includes(search) ||
      item.email.toLowerCase().includes(search) ||
      (item.storeName ?? "").toLowerCase().includes(search)
    );
  });
};

export const userService = {
  getAll: async (params?: UserSearchParams) => {
    const query = buildUsersQuery(params);
    const res = (await getService(
      `${endpoints.users.getAll}?${query}`,
    )) as UserListResponse;

    const rows = sortUsers(
      (res.data ?? []).map(normalizeUser),
      params?.sortBy,
      params?.sortOrder,
    );

    return buildPaginatedResponse(
      rows,
      res.pagination?.page ?? params?.page ?? 1,
      res.pagination?.limit ?? params?.limit ?? 10,
      res.pagination?.total ?? rows.length,
    );
  },

  search: async (params: UserSearchParams) => {
    const query = buildUsersQuery(params, USER_BATCH_LIMIT);
    const res = (await getService(
      `${endpoints.users.getAll}?${query}`,
    )) as UserListResponse;

    const rows = (res.data ?? []).map(normalizeUser);
    const filtered = sortUsers(filterUsers(rows, params), params.sortBy, params.sortOrder);
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const startIndex = (page - 1) * limit;

    return buildPaginatedResponse(
      filtered.slice(startIndex, startIndex + limit),
      page,
      limit,
      filtered.length,
    );
  },

  getById: async (id: string) => {
    const res = (await getService(endpoints.users.getById(id))) as {
      success: boolean;
      data?: UserApiItem;
      message?: string;
    };

    if (!res.data) {
      throw new Error("User details not found.");
    }

    return {
      ...res,
      data: normalizeUser(res.data),
    };
  },

  create: async (data: UserFormValues) => {
    const payload = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      storeId: data.role === UserRole.SUPER_ADMIN ? undefined : data.storeId || undefined,
    };

    const res = (await postService(endpoints.users.create, payload)) as {
      success: boolean;
      data?: UserApiItem;
      message?: string;
    };

    return {
      ...res,
      data: res.data ? normalizeUser(res.data) : undefined,
    };
  },

  update: async (id: string, data: UserFormValues) => {
    const payload = {
      email: data.email || undefined,
      password: data.password || undefined,
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      role: data.role || undefined,
      storeId: data.role === UserRole.SUPER_ADMIN ? null : data.storeId || null,
    };

    const res = (await patchService(endpoints.users.update(id), payload)) as {
      success: boolean;
      data?: UserApiItem;
      message?: string;
    };

    return {
      ...res,
      data: res.data ? normalizeUser(res.data) : undefined,
    };
  },

  delete: (id: string) => deleteService(endpoints.users.delete(id)),

  activate: (id: string) => patchService(endpoints.users.activate(id), {}),

  byStore: (storeId: string) => getService(endpoints.users.byStore(storeId)),
};
