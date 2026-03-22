"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { userService } from "@/services/user.service";
import { UserFormValues } from "@/schemas/user.schema";

type UpdateUserPayload = {
  id: string;
  data: UserFormValues;
};

export const useUserMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });

  const createUser = useMutation({
    mutationFn: (data: UserFormValues) => userService.create(data),
    onSuccess: invalidate,
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: UpdateUserPayload) => userService.update(id, data),
    onSuccess: invalidate,
  });

  const deactivateUser = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: invalidate,
  });

  const activateUser = useMutation({
    mutationFn: (id: string) => userService.activate(id),
    onSuccess: invalidate,
  });

  return {
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
  };
};
