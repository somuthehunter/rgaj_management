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

export type ProductCategory = {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
};

export type WeightUnit = "RATI" | "CARAT";

export type ProductListItem = {
  id: string;
  name: string;
  sku?: string;
  categoryId: string;
  categoryName: string;
  category?: ProductCategory | null;
  weightUnit: WeightUnit;
  pricePerUnit: number;
  hsnCode: string;
  gstRate: number;
  isActive?: boolean;
  active?: boolean;
  status?: string;
  deactivatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  availableWeight?: number;
  totalStones?: number;
};

export type ProductSearchStatus = "active" | "deactivated" | "";

export type ProductSearchParams = {
  search?: string;
  categoryId?: string;
  weightUnit?: WeightUnit | "";
  status?: ProductSearchStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};
