"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { QUERY_KEYS } from "@/constants/query_keys";
import { getUser } from "@/services/session.service";

type ApiResponse<T> = {
  data: T;
};

export const useProducts = () => {
  const user = getUser();

  return useQuery<unknown[]>({
    queryKey: [QUERY_KEYS.PRODUCTS, user?.storeId],
    queryFn: async () => {
      const res = (await productService.getAll()) as ApiResponse<unknown[]>;
      return res.data;
    },
  });
};
