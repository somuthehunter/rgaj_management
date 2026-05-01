"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CategoryFormValues, categorySchema } from "@/schemas/category.schema";
import { useCategoryMutations } from "./useCategoryMutations";
import {
  getCategoryErrorMessage,
  getCategoryFormDefaults,
} from "../_utils/category.utils";
import { UseCategoryDialogFormParams } from "../_types/category-dialog.types";

export const useCategoryDialogForm = ({
  mode,
  category,
  open,
  setOpen,
}: UseCategoryDialogFormParams) => {
  const isEditMode = mode === "edit";
  const { createCategory, updateCategory } = useCategoryMutations();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: getCategoryFormDefaults(category),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(getCategoryFormDefaults(category));
  }, [open, category, form]);

  const pending = createCategory.isPending || updateCategory.isPending;
  const onSubmit = (data: CategoryFormValues) => {
    if (isEditMode && category?.id) {
      updateCategory.mutate(
        { id: category.id, data },
        {
          onSuccess: () => {
            toast.success("Category updated successfully.");
            setOpen(false);
          },
          onError: (error) => {
            toast.error(
              getCategoryErrorMessage(error, "Failed to update category."),
            );
          },
        },
      );
      return;
    }

    createCategory.mutate(data, {
      onSuccess: () => {
        toast.success("Category added successfully.");
        setOpen(false);
        form.reset(getCategoryFormDefaults());
      },
      onError: (error) => {
        toast.error(getCategoryErrorMessage(error, "Failed to add category."));
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
