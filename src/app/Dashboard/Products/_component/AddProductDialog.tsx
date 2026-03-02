"use client";

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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductMutations } from "../_hooks/useProductMutations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState } from "react";
import {
  makingChargeTypes,
  productSchema,
  ProductFormValues,
} from "@/schemas/product.schema";
import { toast } from "sonner";

type ApiErrorDetail = {
  message?: string;
};

type ApiErrorPayload = {
  message?: string;
  error?: {
    message?: string;
    details?: ApiErrorDetail[];
  };
  details?: ApiErrorDetail[];
};

const getMutationErrorMessage = (error: unknown) => {
  if (!error) return "";

  const err = error as Error & { data?: unknown };
  const payload = err.data as ApiErrorPayload | undefined;

  const details = payload?.error?.details ?? payload?.details;
  if (Array.isArray(details)) {
    const detailMessage = details
      .map((item) => item?.message)
      .filter((msg): msg is string => Boolean(msg))
      .join(" | ");

    if (detailMessage) return detailMessage;
  }

  const nestedMessage = payload?.error?.message ?? payload?.message;
  if (typeof nestedMessage === "string" && nestedMessage.trim()) {
    return nestedMessage;
  }

  if (err instanceof Error && err.message && err.message !== "[object Object],[object Object]") {
    return err.message;
  }

  return "Failed to add product.";
};

export default function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const { createProduct } = useProductMutations();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      purity: "",
      hsnCode: "",
      makingChargeType: "PERCENTAGE",
      makingCharge: 0,
      gstRate: 3,
      quantity: 0,
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    // Quantity is kept in UI for now, but backend contract does not accept it yet.
    const { quantity, ...payload } = data;

    createProduct.mutate(payload, {
      onSuccess: () => {
        toast.success("Product added successfully.");
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(getMutationErrorMessage(error));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 pt-2"
        >
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
              <Input
                placeholder="18K"
                {...form.register("purity")}
              />
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

          <div className="grid grid-cols-2 gap-3">
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

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                {...form.register("quantity", { valueAsNumber: true })}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Quantity is kept for now and will be sent after backend support is added.
          </p>

          <Button
            type="submit"
            className="w-full"
            disabled={createProduct.isPending}
          >
            {createProduct.isPending ? "Adding..." : "Add Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
