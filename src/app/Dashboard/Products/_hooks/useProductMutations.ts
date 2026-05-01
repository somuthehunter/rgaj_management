"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { QUERY_KEYS } from "@/constants/query_keys";
import { ProductFormValues } from "@/schemas/product.schema";

type UpdateProductPayload = {
  id: string;
  data: Partial<ProductFormValues>;
};

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });

  const createProduct = useMutation({
    mutationFn: (data: ProductFormValues) => productService.create(data),
    onSuccess: invalidate,
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: UpdateProductPayload) =>
      productService.update(id, data),
    onSuccess: invalidate,
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: invalidate,
  });

  const activateProduct = useMutation({
    mutationFn: (id: string) => productService.activate(id),
    onSuccess: invalidate,
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    activateProduct,
  };
};
