"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { QUERY_TIMINGS } from "@/constants/query_options";
import { PaginatedResponse } from "@/types";
import { RefundListItem, RefundSearchParams } from "@/types/refund";
import { refundService } from "@/services/refund.service";

export const useRefunds = (params?: RefundSearchParams) => {
  const search = params?.search?.trim() ?? "";
  const status = params?.status ?? "";
  const fromDate = params?.fromDate ?? "";
  const toDate = params?.toDate ?? "";
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<PaginatedResponse<RefundListItem>>({
    queryKey: [
      QUERY_KEYS.REFUNDS,
      search,
      status,
      fromDate,
      toDate,
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
        ? refundService.search({
            search,
            status,
            fromDate,
            toDate,
            sortBy,
            sortOrder,
            page,
            limit,
          })
        : refundService.getAll({
            status,
            fromDate,
            toDate,
            sortBy,
            sortOrder,
            page,
            limit,
          }),
  });
};
