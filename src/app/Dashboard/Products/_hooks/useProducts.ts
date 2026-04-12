"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { QUERY_KEYS } from "@/constants/query_keys";
import { getUser } from "@/services/session.service";
import { ApiResponse, PaginatedResponse } from "@/types";
import { ProductListItem, ProductSearchParams } from "@/types/product";

export const useProducts = (params?: ProductSearchParams) => {
  const user = getUser();

  const search = params?.search?.trim() ?? "";
  const categoryId = params?.categoryId ?? "";
  const weightUnit = params?.weightUnit ?? "";
  const isActive = params?.isActive;
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<PaginatedResponse<ProductListItem>>({
    queryKey: [
      QUERY_KEYS.PRODUCTS,
      user?.storeId,
      search,
      categoryId,
      weightUnit,
      isActive,
      sortBy,
      sortOrder,
      page,
      limit,
    ],
    queryFn: async () => {
      const requestParams = {
        search,
        categoryId,
        weightUnit,
        isActive,
        sortBy,
        sortOrder,
        page,
        limit,
      };

      const res = await (search
        ? productService.search(requestParams)
        : productService.getAll(requestParams)) as
        | ApiResponse<ProductListItem[]>
        | PaginatedResponse<ProductListItem>;

      const normalizedData = Array.isArray(res.data) ? res.data : [];
      const normalizedPage =
        "page" in res && typeof res.page === "number" ? res.page : page;
      const normalizedLimit =
        "limit" in res && typeof res.limit === "number" ? res.limit : limit;
      const normalizedTotal =
        "total" in res && typeof res.total === "number"
          ? res.total
          : normalizedData.length;

      return {
        ...(res as ApiResponse<ProductListItem[]>),
        data: normalizedData,
        page: normalizedPage,
        limit: normalizedLimit,
        total: normalizedTotal,
      };
    },
  });
};
