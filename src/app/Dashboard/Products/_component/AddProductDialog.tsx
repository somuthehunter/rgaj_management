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
import { makingChargeTypes } from "@/schemas/product.schema";
import { useProductDialogForm } from "../_hooks/useProductDialogForm";
import { AddProductDialogProps } from "../_types/product-dialog.types";

export default function AddProductDialog({
  mode = "add",
  product,
  trigger,
}: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const { form, pending, isEditMode, onSubmit } = useProductDialogForm({
    mode,
    product,
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
            <Label>Name</Label>
            <Input {...form.register("name")} />
            <p className="text-sm text-destructive">
              {form.formState.errors.name?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label>SKU</Label>
            <Input {...form.register("sku")} />
            <p className="text-sm text-destructive">
              {form.formState.errors.sku?.message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Purity</Label>
              <Input placeholder="18K" {...form.register("purity")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.purity?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label>HSN Code</Label>
              <Input {...form.register("hsnCode")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.hsnCode?.message}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Input {...form.register("category")} />
            <p className="text-sm text-destructive">
              {form.formState.errors.category?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label>GST Rate</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register("gstRate", { valueAsNumber: true })}
            />
            <p className="text-sm text-destructive">
              {form.formState.errors.gstRate?.message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Making Charge Type</Label>
              <Select
                value={form.watch("makingChargeType")}
                onValueChange={(value) =>
                  form.setValue(
                    "makingChargeType",
                    value as (typeof makingChargeTypes)[number],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select charge type" />
                </SelectTrigger>
                <SelectContent>
                  {makingChargeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-destructive">
                {form.formState.errors.makingChargeType?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Making Charge</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("makingCharge", { valueAsNumber: true })}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.makingCharge?.message}
              </p>
            </div>
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
