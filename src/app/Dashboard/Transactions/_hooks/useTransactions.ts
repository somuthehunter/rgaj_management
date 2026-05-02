"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { QUERY_TIMINGS } from "@/constants/query_options";
import { transactionService } from "@/services/transaction.service";
import { PaginatedResponse } from "@/types";
import { TransactionLogItem, TransactionSearchParams } from "@/types/transaction";

export const useTransactions = (params?: TransactionSearchParams) => {
  const search = params?.search?.trim() ?? "";
  const action = params?.action ?? "";
  const entity = params?.entity ?? "";
  const fromDate = params?.fromDate ?? "";
  const toDate = params?.toDate ?? "";
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<PaginatedResponse<TransactionLogItem>>({
    queryKey: [
      QUERY_KEYS.TRANSACTIONS,
      search,
      action,
      entity,
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
        ? transactionService.search({
            search,
            action,
            entity,
            fromDate,
            toDate,
            sortBy,
            sortOrder,
            page,
            limit,
          })
        : transactionService.getAll({
            action,
            entity,
            fromDate,
            toDate,
            sortBy,
            sortOrder,
            page,
            limit,
          }),
  });
};
