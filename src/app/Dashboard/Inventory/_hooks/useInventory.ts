"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { QUERY_TIMINGS } from "@/constants/query_options";
import { inventoryService } from "@/services/inventory.service";
import { PaginatedResponse } from "@/types";
import { InventoryListItem, InventorySearchParams } from "@/types/inventory";

type UseInventoryOptions = {
  enabled?: boolean;
};

export const useInventory = (
  params?: InventorySearchParams,
  options?: UseInventoryOptions,
) => {
  const search = params?.search?.trim() ?? "";
  const storeId = params?.storeId ?? "";
  const category = params?.category ?? "";
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<PaginatedResponse<InventoryListItem>>({
    queryKey: [
      QUERY_KEYS.INVENTORY,
      search,
      storeId,
      category,
      sortBy,
      sortOrder,
      page,
      limit,
    ],
    enabled: options?.enabled ?? true,
    staleTime: QUERY_TIMINGS.LIVE_STALE_MS,
    gcTime: QUERY_TIMINGS.DETAIL_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    queryFn: () =>
      inventoryService.getAll({
        search,
        storeId,
        category,
        sortBy,
        sortOrder,
        page,
        limit,
      }),
  });
};
