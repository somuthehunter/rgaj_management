"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { storeService } from "@/services/store.service";
import { UserRole } from "@/types";
import { useUserDialogForm } from "../_hooks/useUserDialogForm";
import { AddUserDialogProps } from "../_types/user-dialog.types";

export default function AddUserDialog({
  mode = "add",
  user,
  trigger,
}: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const { form, pending, isEditMode, onSubmit } = useUserDialogForm({
    mode,
    user,
    open,
    setOpen,
  });
  const storeOptions = storeService.getOptions();
  const selectedRole = form.watch("role");

  const fallbackTrigger = useMemo(() => {
    if (isEditMode) return <Button variant="outline">Edit</Button>;

    return (
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add User
      </Button>
    );
  }, [isEditMode]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? fallbackTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register("name")} />
            <p className="text-sm text-destructive">{form.formState.errors.name?.message}</p>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...form.register("email")} />
            <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...form.register("phone")} />
              <p className="text-sm text-destructive">{form.formState.errors.phone?.message}</p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                      <SelectItem value={UserRole.STORE_ADMIN}>Store Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-sm text-destructive">{form.formState.errors.role?.message}</p>
            </div>
          </div>

          {selectedRole === UserRole.STORE_ADMIN && (
            <div className="space-y-2">
              <Label>Store</Label>
              <Controller
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {storeOptions.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update User"
                : "Add User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
