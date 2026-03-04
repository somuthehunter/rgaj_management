"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ProductFormValues, productSchema } from "@/schemas/product.schema";
import { useProductMutations } from "./useProductMutations";
import {
  getProductErrorMessage,
  getProductFormDefaults,
} from "../_utils/product.utils";
import { UseProductDialogFormParams } from "../_types/product-dialog.types";

export const useProductDialogForm = ({
  mode,
  product,
  open,
  setOpen,
}: UseProductDialogFormParams) => {
  const isEditMode = mode === "edit";
  const { createProduct, updateProduct } = useProductMutations();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: getProductFormDefaults(product),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(getProductFormDefaults(product));
  }, [open, product, form]);

  const pending = createProduct.isPending || updateProduct.isPending;

  const onSubmit = (data: ProductFormValues) => {
    const { quantity, ...payload } = data;

    if (isEditMode && product?.id) {
      updateProduct.mutate(
        { id: product.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Product updated successfully.");
            setOpen(false);
          },
          onError: (error) => {
            toast.error(getProductErrorMessage(error, "Failed to update product."));
          },
        },
      );
      return;
    }

    createProduct.mutate(payload, {
      onSuccess: () => {
        toast.success("Product added successfully.");
        setOpen(false);
        form.reset(getProductFormDefaults());
      },
      onError: (error) => {
        toast.error(getProductErrorMessage(error, "Failed to add product."));
      },
    });
  };

  return {
    form,
    pending,
    isEditMode,
    onSubmit,
  };
};
