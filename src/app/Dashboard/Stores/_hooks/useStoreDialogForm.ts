"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { StoreFormValues, storeSchema } from "@/schemas/store.schema";
import { useStoreMutations } from "./useStoreMutations";
import { UseStoreDialogFormParams } from "../_types/store-dialog.types";
import { getStoreErrorMessage, getStoreFormDefaults } from "../_utils/store.utils";

export const useStoreDialogForm = ({
  mode,
  store,
  open,
  setOpen,
}: UseStoreDialogFormParams) => {
  const isEditMode = mode === "edit";
  const { createStore, updateStore } = useStoreMutations();

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: getStoreFormDefaults(store),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(getStoreFormDefaults(store));
  }, [form, open, store]);

  const pending = createStore.isPending || updateStore.isPending;

  const onSubmit = (data: StoreFormValues) => {
    if (isEditMode && store?.id) {
      updateStore.mutate(
        { id: store.id, data },
        {
          onSuccess: () => {
            toast.success("Store updated successfully.");
            setOpen(false);
          },
          onError: (error) =>
            toast.error(getStoreErrorMessage(error, "Failed to update store.")),
        },
      );
      return;
    }

    createStore.mutate(data, {
      onSuccess: () => {
        toast.success("Store added successfully.");
        setOpen(false);
        form.reset(getStoreFormDefaults());
      },
      onError: (error) =>
        toast.error(getStoreErrorMessage(error, "Failed to add store.")),
    });
  };

  return {
    form,
    pending,
    isEditMode,
    onSubmit,
  };
};
