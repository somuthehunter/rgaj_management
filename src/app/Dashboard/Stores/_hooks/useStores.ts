"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { storeService } from "@/services/store.service";
import { PaginatedResponse } from "@/types";
import { StoreListItem, StoreSearchParams } from "@/types/store";

export const useStores = (params?: StoreSearchParams) => {
  const search = params?.search?.trim() ?? "";
  const isActive = params?.isActive;
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<PaginatedResponse<StoreListItem>>({
    queryKey: [QUERY_KEYS.STORES, search, isActive, sortBy, sortOrder, page, limit],
    queryFn: () =>
      search
        ? storeService.search({ search, isActive, sortBy, sortOrder, page, limit })
        : storeService.getAll({ isActive, sortBy, sortOrder, page, limit }),
  });
};
