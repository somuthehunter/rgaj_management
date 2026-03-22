"use client";

import { toast } from "sonner";
import { useStoreMutations } from "./useStoreMutations";
import { getStoreErrorMessage } from "../_utils/store.utils";

export const useStoreActions = () => {
  const { deactivateStore, activateStore } = useStoreMutations();

  const handleDeactivate = (id: string) =>
    deactivateStore.mutate(id, {
      onSuccess: () => toast.success("Store deactivated successfully."),
      onError: (error) =>
        toast.error(getStoreErrorMessage(error, "Failed to deactivate store.")),
    });

  const handleActivate = (id: string) =>
    activateStore.mutate(id, {
      onSuccess: () => toast.success("Store activated successfully."),
      onError: (error) =>
        toast.error(getStoreErrorMessage(error, "Failed to activate store.")),
    });

  return {
    handleDeactivate,
    handleActivate,
  };
};
