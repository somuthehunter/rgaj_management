import { UserRole, PaginatedResponse } from "@/types";
import { UserFormValues } from "@/schemas/user.schema";
import { UserListItem, UserSearchParams } from "@/types/user";
import { storeService } from "@/services/store.service";

let mockUsers: UserListItem[] = [
  {
    id: "user-1",
    name: "Sourav Admin",
    email: "sourav.admin@example.com",
    phone: "+91 9876500001",
    role: UserRole.SUPER_ADMIN,
    storeName: "Main Showroom",
    isActive: true,
    createdAt: "2026-03-02T09:00:00.000Z",
    lastLoginAt: "2026-03-22T08:30:00.000Z",
  },
  {
    id: "user-2",
    name: "Priya Manager",
    email: "priya.manager@example.com",
    phone: "+91 9876500002",
    role: UserRole.STORE_ADMIN,
    storeId: "store-2",
    storeName: "City Branch",
    isActive: true,
    createdAt: "2026-03-04T11:00:00.000Z",
    lastLoginAt: "2026-03-21T17:45:00.000Z",
  },
  {
    id: "user-3",
    name: "Rohan Sen",
    email: "rohan.sen@example.com",
    phone: "+91 9876500003",
    role: UserRole.STORE_ADMIN,
    storeId: "store-3",
    storeName: "Mall Branch",
    isActive: false,
    createdAt: "2026-03-05T15:00:00.000Z",
    lastLoginAt: "2026-03-18T09:10:00.000Z",
    deactivatedAt: "2026-03-20T11:00:00.000Z",
  },
];

const delay = async () =>
  new Promise((resolve) => window.setTimeout(resolve, 120));

const normalizeActive = (item: UserListItem) => {
  if (typeof item.isActive === "boolean") return item.isActive;
  if (typeof item.status === "string") return item.status.toUpperCase() === "ACTIVE";
  if (item.deactivatedAt) return false;
  return true;
};

const sortUsers = (
  rows: UserListItem[],
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
): PaginatedResponse<UserListItem> => {
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

const filterUsers = (params?: UserSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  const filtered = mockUsers.filter((item) => {
    const matchesSearch = !search
      ? true
      : item.name.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.phone.toLowerCase().includes(search);

    const matchesStore = params?.storeId ? item.storeId === params.storeId : true;
    const matchesRole = params?.role ? item.role === params.role : true;
    const matchesStatus =
      typeof params?.isActive === "boolean"
        ? normalizeActive(item) === params.isActive
        : true;

    return matchesSearch && matchesStore && matchesRole && matchesStatus;
  });

  return sortUsers(filtered, params?.sortBy, params?.sortOrder);
};

export const userService = {
  // Replace this mock implementation with real user API calls when the backend is ready.
  getAll: async (params?: UserSearchParams) => {
    await delay();
    const rows = filterUsers(params);
    return buildPaginatedResponse(rows, params?.page, params?.limit);
  },

  search: async (params: UserSearchParams) => {
    await delay();
    const rows = filterUsers(params);
    return buildPaginatedResponse(rows, params.page, params.limit);
  },

  create: async (data: UserFormValues) => {
    await delay();
    const stores = storeService.getOptions();
    const selectedStore = stores.find((store) => store.id === data.storeId);

    const nextUser: UserListItem = {
      id: `user-${Date.now()}`,
      ...data,
      storeName: selectedStore?.name,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    mockUsers = [nextUser, ...mockUsers];

    return {
      success: true,
      data: nextUser,
      message: "User created.",
    };
  },

  update: async (id: string, data: UserFormValues) => {
    await delay();
    const stores = storeService.getOptions();
    const selectedStore = stores.find((store) => store.id === data.storeId);
    let updatedUser: UserListItem | null = null;

    mockUsers = mockUsers.map((item) => {
      if (item.id !== id) return item;

      updatedUser = {
        ...item,
        ...data,
        storeName: selectedStore?.name,
      };

      return updatedUser;
    });

    return {
      success: true,
      data: updatedUser,
      message: "User updated.",
    };
  },

  delete: async (id: string) => {
    await delay();
    mockUsers = mockUsers.map((item) =>
      item.id === id
        ? { ...item, isActive: false, deactivatedAt: new Date().toISOString() }
        : item,
    );

    return {
      success: true,
      data: true,
      message: "User deactivated.",
    };
  },

  activate: async (id: string) => {
    await delay();
    mockUsers = mockUsers.map((item) =>
      item.id === id
        ? { ...item, isActive: true, deactivatedAt: undefined }
        : item,
    );

    return {
      success: true,
      data: true,
      message: "User activated.",
    };
  },
};
