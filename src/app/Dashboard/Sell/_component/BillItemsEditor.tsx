"use client";

import { Control, UseFieldArrayReturn, UseFormRegister, UseFormWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SellableProduct } from "@/types/billing";
import { BillFormValues } from "@/schemas/bill.schema";
import { Controller, FieldErrors } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { formatOrderCurrency } from "@/app/Dashboard/Orders/_utils/order.utils";
import { getSellLineTotals } from "../_utils/bill.utils";

type BillItemsEditorProps = {
  control: Control<BillFormValues>;
  register: UseFormRegister<BillFormValues>;
  watch: UseFormWatch<BillFormValues>;
  errors: FieldErrors<BillFormValues>;
  products: SellableProduct[];
  goldRatePerGram: number;
  itemsFieldArray: UseFieldArrayReturn<BillFormValues, "items", "id">;
};

export default function BillItemsEditor({
  control,
  register,
  watch,
  errors,
  products,
  goldRatePerGram,
  itemsFieldArray,
}: BillItemsEditorProps) {
  const watchedItems = watch("items");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Bill Items</h3>
          <p className="text-xs text-muted-foreground">
            Add products from store inventory and enter sold weight details.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            itemsFieldArray.append({
              productId: "",
              actualWeight: 0,
              stoneWeight: 0,
              stoneCount: 0,
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {itemsFieldArray.fields.map((field, index) => {
          const selectedProduct = products.find(
            (product) => product.id === watchedItems?.[index]?.productId,
          );
          const actualWeight = watchedItems?.[index]?.actualWeight ?? 0;
          const stoneWeight = watchedItems?.[index]?.stoneWeight ?? 0;
          const totals = getSellLineTotals(
            selectedProduct,
            actualWeight,
            goldRatePerGram,
            stoneWeight,
          );

          return (
            <div key={field.id} className="rounded-lg border p-4">
              <div className="grid gap-4 xl:grid-cols-[2fr_120px_120px_120px_1fr_auto]">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Controller
                    control={control}
                    name={`items.${index}.productId`}
                    render={({ field: controllerField }) => (
                      <Select
                        value={controllerField.value}
                        onValueChange={controllerField.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-sm text-destructive">
                    {errors.items?.[index]?.productId?.message}
                  </p>
                  {selectedProduct && (
                    <p className="text-xs text-muted-foreground">
                      {selectedProduct.category} | Available:{" "}
                      {selectedProduct.availableWeight.toFixed(3)} g
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Weight (g)</Label>
                  <Input
                    type="number"
                    min="0.001"
                    step="0.001"
                    {...register(`items.${index}.actualWeight`, { valueAsNumber: true })}
                  />
                  <p className="text-sm text-destructive">
                    {errors.items?.[index]?.actualWeight?.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Stone Wt.</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    {...register(`items.${index}.stoneWeight`, { valueAsNumber: true })}
                  />
                  <p className="text-sm text-destructive">
                    {errors.items?.[index]?.stoneWeight?.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Stone Cnt.</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...register(`items.${index}.stoneCount`, { valueAsNumber: true })}
                  />
                  <p className="text-sm text-destructive">
                    {errors.items?.[index]?.stoneCount?.message}
                  </p>
                </div>

                <div className="space-y-1 rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Estimated Total</p>
                  <p className="text-sm font-medium">{formatOrderCurrency(totals.total)}</p>
                  <p className="text-xs text-muted-foreground">
                    Net gold {totals.netGoldWeight.toFixed(3)} g
                  </p>
                </div>

                <div className="flex items-start justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => itemsFieldArray.remove(index)}
                    disabled={itemsFieldArray.fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
