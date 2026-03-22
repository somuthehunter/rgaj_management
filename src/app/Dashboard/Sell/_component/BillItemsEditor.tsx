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
  itemsFieldArray: UseFieldArrayReturn<BillFormValues, "items", "id">;
};

export default function BillItemsEditor({
  control,
  register,
  watch,
  errors,
  products,
  itemsFieldArray,
}: BillItemsEditorProps) {
  const watchedItems = watch("items");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Bill Items</h3>
          <p className="text-xs text-muted-foreground">
            Add products, quantity, and generate a customer bill.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => itemsFieldArray.append({ productId: "", quantity: 1 })}
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
          const quantity = watchedItems?.[index]?.quantity ?? 0;
          const totals = getSellLineTotals(selectedProduct, quantity);

          return (
            <div key={field.id} className="rounded-lg border p-4">
              <div className="grid gap-4 lg:grid-cols-[2fr_120px_1fr_auto]">
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
                      {selectedProduct.category} | Available: {selectedProduct.availableQuantity}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <p className="text-sm text-destructive">
                    {errors.items?.[index]?.quantity?.message}
                  </p>
                </div>

                <div className="space-y-1 rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Line Total</p>
                  <p className="text-sm font-medium">{formatOrderCurrency(totals.total)}</p>
                  <p className="text-xs text-muted-foreground">
                    Base {formatOrderCurrency(totals.subtotal)} + Tax {formatOrderCurrency(totals.tax)}
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
