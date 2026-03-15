"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { inventoryService } from "@/services/inventory.service";
import { PaginatedResponse } from "@/types";
import { InventoryListItem, InventorySearchParams } from "@/types/inventory";

export const useInventory = (params?: InventorySearchParams) => {
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
