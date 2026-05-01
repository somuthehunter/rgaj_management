export type CategoryListItem = {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  active?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CategorySearchStatus = "active" | "deactivated" | "";

export type CategorySearchParams = {
  search?: string;
  status?: CategorySearchStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
  includeInactive?: boolean;
};
