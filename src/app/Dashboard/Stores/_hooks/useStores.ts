"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { QUERY_TIMINGS } from "@/constants/query_options";
import { storeService } from "@/services/store.service";
import { PaginatedResponse } from "@/types";
import { StoreListItem, StoreSearchParams } from "@/types/store";

type UseStoresOptions = {
  enabled?: boolean;
};

export const useStores = (
  params?: StoreSearchParams,
  options?: UseStoresOptions,
) => {
  const search = params?.search?.trim() ?? "";
  const isActive = params?.isActive;
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<PaginatedResponse<StoreListItem>>({
    queryKey: [QUERY_KEYS.STORES, search, isActive, sortBy, sortOrder, page, limit],
    enabled: options?.enabled ?? true,
    staleTime: QUERY_TIMINGS.LIST_STALE_MS,
    gcTime: QUERY_TIMINGS.DETAIL_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    queryFn: () =>
      search
        ? storeService.search({ search, isActive, sortBy, sortOrder, page, limit })
        : storeService.getAll({ isActive, sortBy, sortOrder, page, limit }),
  });
};
