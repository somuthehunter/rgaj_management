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
import { Textarea } from "@/components/ui/textarea";
import { useCategoryDialogForm } from "../_hooks/useCategoryDialogForm";
import { AddCategoryDialogProps } from "../_types/category-dialog.types";

export default function AddCategoryDialog({
  mode = "add",
  category,
  trigger,
}: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { form, pending, isEditMode, onSubmit } = useCategoryDialogForm({
    mode,
    category,
    open,
    setOpen,
  });

  const fallbackTrigger = useMemo(() => {
    if (isEditMode) return <Button variant="outline">Edit</Button>;

    return (
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Category
      </Button>
    );
  }, [isEditMode]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? fallbackTrigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register("name")} />
            <p className="text-sm text-destructive">
              {form.formState.errors.name?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input {...form.register("slug")} />
            <p className="text-sm text-destructive">
              {form.formState.errors.slug?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={4} {...form.register("description")} />
            <p className="text-sm text-destructive">
              {form.formState.errors.description?.message}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update Category"
                : "Add Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
