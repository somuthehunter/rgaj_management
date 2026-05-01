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
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductDialogForm } from "../_hooks/useProductDialogForm";
import { AddProductDialogProps } from "../_types/product-dialog.types";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { weightUnits } from "@/schemas/product.schema";

export default function AddProductDialog({
  mode = "add",
  product,
  trigger,
}: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const productDetailsQuery = useQuery({
    queryKey: ["product-details", product?.id],
    queryFn: () => productService.getById(product!.id),
    enabled: open && mode === "edit" && Boolean(product?.id),
  });
  const categoriesQuery = useQuery({
    queryKey: ["product-category-options"],
    queryFn: () => categoryService.getAll({ isActive: true, page: 1, limit: 200 }),
    enabled: open,
  });
  const { form, pending, isEditMode, onSubmit } = useProductDialogForm({
    mode,
    product: productDetailsQuery.data?.data ?? product,
    open,
    setOpen,
  });

  const fallbackTrigger = useMemo(() => {
    if (isEditMode) return <Button variant="outline">Edit</Button>;

    return (
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Product
      </Button>
    );
  }, [isEditMode]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? fallbackTrigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input placeholder="Enter product name" {...form.register("name")} />
            <p className="text-sm text-destructive">
              {form.formState.errors.name?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label>SKU</Label>
            <Input placeholder="Leave blank to auto-generate" {...form.register("sku")} />
            <p className="text-sm text-destructive">
              {form.formState.errors.sku?.message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(value) => form.setValue("categoryId", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(categoriesQuery.data?.data ?? []).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-destructive">
                {form.formState.errors.categoryId?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Weight Unit *</Label>
              <Select
                value={form.watch("weightUnit")}
                onValueChange={(value) =>
                  form.setValue("weightUnit", value as (typeof weightUnits)[number], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {weightUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-destructive">
                {form.formState.errors.weightUnit?.message}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Price Per Unit *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter price per unit"
                {...form.register("pricePerUnit", { valueAsNumber: true })}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.pricePerUnit?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label>GST Rate *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Enter GST rate"
                {...form.register("gstRate", { valueAsNumber: true })}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.gstRate?.message}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>HSN Code *</Label>
            <Input placeholder="Enter HSN code" {...form.register("hsnCode")} />
            <p className="text-sm text-destructive">
              {form.formState.errors.hsnCode?.message}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update Product"
                : "Add Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
