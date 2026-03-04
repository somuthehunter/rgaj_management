"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { QUERY_KEYS } from "@/constants/query_keys";
import { getUser } from "@/services/session.service";
import { ApiResponse } from "@/types";
import { ProductListItem, ProductSearchParams } from "@/types/product";

export const useProducts = (params?: ProductSearchParams) => {
  const user = getUser();

  const search = params?.search?.trim() ?? "";
  const category = params?.category ?? "";
  const status = params?.status ?? "";
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";

  const hasSearchParams = Boolean(
    search || category || status || sortBy || sortOrder,
  );

  return useQuery<ProductListItem[]>({
    queryKey: [
      QUERY_KEYS.PRODUCTS,
      user?.storeId,
      search,
      category,
      status,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const res = (hasSearchParams
        ? await productService.search({
            search,
            category,
            status,
            sortBy,
            sortOrder,
          })
        : await productService.getAll()) as ApiResponse<ProductListItem[]>;
      return res.data;
    },
  });
};
