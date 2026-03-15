"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { categoryService } from "@/services/category.service";
import { PaginatedResponse } from "@/types";
import { CategoryListItem, CategorySearchParams } from "@/types/category";

export const useCategories = (params?: CategorySearchParams) => {
  const search = params?.search?.trim() ?? "";
  const isActive = params?.isActive;
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<PaginatedResponse<CategoryListItem>>({
    queryKey: [
      QUERY_KEYS.CATEGORIES,
      search,
      isActive,
      sortBy,
      sortOrder,
      page,
      limit,
    ],
    queryFn: () =>
      search
        ? categoryService.search({
            search,
            isActive,
            sortBy,
            sortOrder,
            page,
            limit,
          })
        : categoryService.getAll({
            isActive,
            sortBy,
            sortOrder,
            page,
            limit,
          }),
  });
};
