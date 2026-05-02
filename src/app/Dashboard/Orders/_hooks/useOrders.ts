"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { QUERY_TIMINGS } from "@/constants/query_options";
import { orderService } from "@/services/order.service";
import { PaginatedResponse } from "@/types";
import { OrderListItem, OrderSearchParams } from "@/types/order";

export const useOrders = (params?: OrderSearchParams) => {
  const search = params?.search?.trim() ?? "";
  const storeId = params?.storeId ?? "";
  const status = params?.status ?? "";
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<PaginatedResponse<OrderListItem>>({
    queryKey: [
      QUERY_KEYS.ORDERS,
      search,
      storeId,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    ],
    staleTime: QUERY_TIMINGS.LIST_STALE_MS,
    gcTime: QUERY_TIMINGS.DETAIL_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    queryFn: () =>
      search
        ? orderService.search({
            search,
            storeId,
            status,
            sortBy,
            sortOrder,
            page,
            limit,
          })
        : orderService.getAll({
            storeId,
            status,
            sortBy,
            sortOrder,
            page,
            limit,
          }),
  });
};
