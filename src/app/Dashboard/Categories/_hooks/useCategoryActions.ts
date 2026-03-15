"use client";

import { toast } from "sonner";
import { useCategoryMutations } from "./useCategoryMutations";
import { getCategoryErrorMessage } from "../_utils/category.utils";

export const useCategoryActions = () => {
  const { deleteCategory, activateCategory } = useCategoryMutations();

  const handleDeactivate = (id: string) =>
    deleteCategory.mutate(id, {
      onSuccess: () => {
        toast.success("Category deactivated successfully.");
      },
      onError: (error) => {
        toast.error(
          getCategoryErrorMessage(error, "Failed to deactivate category."),
        );
      },
    });

  const handleActivate = (id: string) =>
    activateCategory.mutate(id, {
      onSuccess: () => {
        toast.success("Category activated successfully.");
      },
      onError: (error) => {
        toast.error(
          getCategoryErrorMessage(error, "Failed to activate category."),
        );
      },
    });

  return {
    handleDeactivate,
    handleActivate,
  };
};
