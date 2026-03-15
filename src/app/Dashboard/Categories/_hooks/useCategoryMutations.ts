"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { CategoryFormValues } from "@/schemas/category.schema";
import { categoryService } from "@/services/category.service";

type UpdateCategoryPayload = {
  id: string;
  data: CategoryFormValues;
};

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });

  const createCategory = useMutation({
    mutationFn: (data: CategoryFormValues) => categoryService.create(data),
    onSuccess: invalidate,
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: UpdateCategoryPayload) =>
      categoryService.update(id, data),
    onSuccess: invalidate,
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: invalidate,
  });

  const activateCategory = useMutation({
    mutationFn: (id: string) => categoryService.activate(id),
    onSuccess: invalidate,
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    activateCategory,
  };
};
