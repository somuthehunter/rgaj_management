"use client";

import { toast } from "sonner";
import { useProductMutations } from "./useProductMutations";
import { getProductErrorMessage } from "../_utils/product.utils";

export const useProductActions = () => {
  const { deleteProduct, activateProduct } = useProductMutations();

  const handleDeactivate = (id: string) =>
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast.success("Product deactivated successfully.");
      },
      onError: (error) => {
        toast.error(getProductErrorMessage(error, "Failed to deactivate product."));
      },
    });

  const handleActivate = (id: string) =>
    activateProduct.mutate(id, {
      onSuccess: () => {
        toast.success("Product activated successfully.");
      },
      onError: (error) => {
        toast.error(getProductErrorMessage(error, "Failed to activate product."));
      },
    });

  return {
    handleDeactivate,
    handleActivate,
  };
};
