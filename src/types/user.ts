import { UserRole } from "@/types";

export type UserListItem = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  storeId?: string | null;
  storeName?: string;
  isActive?: boolean;
  status?: string;
  deactivatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserSearchStatus = "active" | "deactivated" | "";

export type UserSearchParams = {
  search?: string;
  storeId?: string;
  role?: UserRole | "";
  status?: UserSearchStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};
