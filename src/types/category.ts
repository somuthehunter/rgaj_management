export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  isActive?: boolean;
  active?: boolean;
  status?: string;
  createdAt?: string;
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
};
