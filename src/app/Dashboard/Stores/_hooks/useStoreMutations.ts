"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { storeService } from "@/services/store.service";
import { StoreFormValues } from "@/schemas/store.schema";

type UpdateStorePayload = {
  id: string;
  data: StoreFormValues;
};

export const useStoreMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STORES] });

  const createStore = useMutation({
    mutationFn: (data: StoreFormValues) => storeService.create(data),
    onSuccess: invalidate,
  });

  const updateStore = useMutation({
    mutationFn: ({ id, data }: UpdateStorePayload) => storeService.update(id, data),
    onSuccess: invalidate,
  });

  const deactivateStore = useMutation({
    mutationFn: (id: string) => storeService.delete(id),
    onSuccess: invalidate,
  });

  const activateStore = useMutation({
    mutationFn: (id: string) => storeService.activate(id),
    onSuccess: invalidate,
  });

  return {
    createStore,
    updateStore,
    deactivateStore,
    activateStore,
  };
};
