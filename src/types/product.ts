export type ApiErrorDetail = {
  message?: string;
};

export type ApiErrorPayload = {
  message?: string;
  error?: {
    message?: string;
    details?: ApiErrorDetail[];
  };
  details?: ApiErrorDetail[];
};

export type ProductListItem = {
  id: string;
  name?: string;
  sku?: string;
  category?: string;
  purity?: string;
  hsnCode?: string;
  makingChargeType?: "PER_GRAM" | "FIXED" | "PERCENTAGE";
  makingCharge?: number;
  gstRate?: number;
  isActive?: boolean;
  active?: boolean;
  status?: string;
  deactivatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductSearchStatus = "active" | "deactivated" | "";

export type ProductSearchParams = {
  search?: string;
  category?: string;
  purity?: string;
  status?: ProductSearchStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};
