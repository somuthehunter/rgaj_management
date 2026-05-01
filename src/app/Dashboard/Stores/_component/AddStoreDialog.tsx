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
import { useStoreDialogForm } from "../_hooks/useStoreDialogForm";
import { AddStoreDialogProps } from "../_types/store-dialog.types";

export default function AddStoreDialog({
  mode = "add",
  store,
  trigger,
}: AddStoreDialogProps) {
  const [open, setOpen] = useState(false);
  const { form, pending, isEditMode, onSubmit } = useStoreDialogForm({
    mode,
    store,
    open,
    setOpen,
  });

  const fallbackTrigger = useMemo(() => {
    if (isEditMode) return <Button variant="outline">Edit</Button>;

    return (
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Store
      </Button>
    );
  }, [isEditMode]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? fallbackTrigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Store" : "Add Store"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Store Code</Label>
              <Input {...form.register("code")} placeholder="Auto-generated if left blank" maxLength={20} />
              <p className="text-sm text-destructive">{form.formState.errors.code?.message}</p>
            </div>
            <div className="space-y-2">
              <Label>Store Name *</Label>
              <Input {...form.register("name")} placeholder="Enter store name" maxLength={80} />
              <p className="text-sm text-destructive">{form.formState.errors.name?.message}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address *</Label>
            <Input {...form.register("address")} placeholder="Enter store address" maxLength={200} />
            <p className="text-sm text-destructive">{form.formState.errors.address?.message}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>City *</Label>
              <Input {...form.register("city")} placeholder="Enter city" maxLength={50} />
              <p className="text-sm text-destructive">{form.formState.errors.city?.message}</p>
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Input {...form.register("state")} placeholder="Enter state" maxLength={50} />
              <p className="text-sm text-destructive">{form.formState.errors.state?.message}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input
              {...form.register("phone")}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit phone number"
            />
            <p className="text-sm text-destructive">{form.formState.errors.phone?.message}</p>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update Store"
                : "Add Store"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
