"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { customerService } from "@/services/customer.service";
import { PaginatedResponse } from "@/types";
import { CustomerListItem, CustomerSearchParams } from "@/types/customer";

export const useCustomers = (params?: CustomerSearchParams) => {
  const search = params?.search?.trim() ?? "";
  const storeName = params?.storeName ?? "";
  const sortBy = params?.sortBy ?? "";
  const sortOrder = params?.sortOrder ?? "";
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<PaginatedResponse<CustomerListItem>>({
    queryKey: [
      QUERY_KEYS.CUSTOMERS,
      search,
      storeName,
      sortBy,
      sortOrder,
      page,
      limit,
    ],
    queryFn: () =>
      search
        ? customerService.search({
            search,
            storeName,
            sortBy,
            sortOrder,
            page,
            limit,
          })
        : customerService.getAll({
            storeName,
            sortBy,
            sortOrder,
            page,
            limit,
          }),
  });
};
