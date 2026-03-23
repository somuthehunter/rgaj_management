"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserFormValues, userSchema } from "@/schemas/user.schema";
import { useUserMutations } from "./useUserMutations";
import { UseUserDialogFormParams } from "../_types/user-dialog.types";
import { getUserEntityErrorMessage, getUserFormDefaults } from "../_utils/user.utils";

export const useUserDialogForm = ({
  mode,
  user,
  open,
  setOpen,
}: UseUserDialogFormParams) => {
  const isEditMode = mode === "edit";
  const { createUser, updateUser } = useUserMutations();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: getUserFormDefaults(user),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(getUserFormDefaults(user));
  }, [form, open, user]);

  const pending = createUser.isPending || updateUser.isPending;

  const onSubmit = (data: UserFormValues) => {
    const normalizedData = {
      ...data,
      storeId: data.role === "SUPER_ADMIN" ? "" : data.storeId,
    };

    if (isEditMode && user?.id) {
      updateUser.mutate(
        { id: user.id, data: normalizedData },
        {
          onSuccess: () => {
            toast.success("User updated successfully.");
            setOpen(false);
          },
          onError: (error) =>
            toast.error(getUserEntityErrorMessage(error, "Failed to update user.")),
        },
      );
      return;
    }

    createUser.mutate(normalizedData, {
      onSuccess: () => {
        toast.success("User added successfully.");
        setOpen(false);
        form.reset(getUserFormDefaults());
      },
      onError: (error) =>
        toast.error(getUserEntityErrorMessage(error, "Failed to add user.")),
    });
  };

  return {
    form,
    pending,
    isEditMode,
    onSubmit,
  };
};
