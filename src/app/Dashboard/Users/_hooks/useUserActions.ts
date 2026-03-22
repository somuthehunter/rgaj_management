"use client";

import { toast } from "sonner";
import { useUserMutations } from "./useUserMutations";
import { getUserEntityErrorMessage } from "../_utils/user.utils";

export const useUserActions = () => {
  const { deactivateUser, activateUser } = useUserMutations();

  const handleDeactivate = (id: string) =>
    deactivateUser.mutate(id, {
      onSuccess: () => toast.success("User deactivated successfully."),
      onError: (error) =>
        toast.error(getUserEntityErrorMessage(error, "Failed to deactivate user.")),
    });

  const handleActivate = (id: string) =>
    activateUser.mutate(id, {
      onSuccess: () => toast.success("User activated successfully."),
      onError: (error) =>
        toast.error(getUserEntityErrorMessage(error, "Failed to activate user.")),
    });

  return {
    handleDeactivate,
    handleActivate,
  };
};
