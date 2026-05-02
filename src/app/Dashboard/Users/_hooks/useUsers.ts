"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { QUERY_TIMINGS } from "@/constants/query_options";
import { userService } from "@/services/user.service";
import { PaginatedResponse } from "@/types";
import { UserListItem, UserSearchParams } from "@/types/user";

export const useUsers = (params?: UserSearchParams) => {
  const search = params?.search?.trim() ?? "";
  const storeId = params?.storeId ?? "";
  const role = params?.role ?? "";
  const isActive = params?.isActive;
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<PaginatedResponse<UserListItem>>({
    queryKey: [QUERY_KEYS.USERS, search, storeId, role, isActive, sortBy, sortOrder, page, limit],
    staleTime: QUERY_TIMINGS.LIST_STALE_MS,
    gcTime: QUERY_TIMINGS.DETAIL_STALE_MS,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    queryFn: () =>
      search
        ? userService.search({ search, storeId, role, isActive, sortBy, sortOrder, page, limit })
        : userService.getAll({ storeId, role, isActive, sortBy, sortOrder, page, limit }),
  });
};
