export type StoreListItem = {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  managerName?: string;
  userCount: number;
  isActive?: boolean;
  status?: string;
  deactivatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreStats = {
  store: {
    id: string;
    code: string;
    name: string;
  };
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalProducts: number;
    totalInvoices: number;
  };
};

export type StoreSearchStatus = "active" | "deactivated" | "";

export type StoreSearchParams = {
  search?: string;
  status?: StoreSearchStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};
