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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Boxes } from "lucide-react";
import { toast } from "sonner";
import { Store } from "@/types";
import { ProductListItem } from "@/types/product";
import { InventoryMeasurementUnit } from "@/types/inventory";

type InventoryDistributeDialogProps = {
  products?: ProductListItem[];
  stores: Store[];
};

export default function InventoryDistributeDialog({
  products = [],
  stores,
}: InventoryDistributeDialogProps) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [quantityNumber, setQuantityNumber] = useState("");
  const [measuredQuantity, setMeasuredQuantity] = useState("");
  const [measurementUnit, setMeasurementUnit] =
    useState<InventoryMeasurementUnit>("ratti");

  const productOptions = useMemo(
    () =>
      products.filter(
        (product) =>
          product.id &&
          product.name &&
          (product.isActive ?? product.active ?? true),
      ),
    [products],
  );

  const resetForm = () => {
    setProductId("");
    setStoreId("");
    setQuantityNumber("");
    setMeasuredQuantity("");
    setMeasurementUnit("ratti");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.info("Distribution UI is ready. API integration will be added later.");
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Boxes className="mr-2 h-4 w-4" />
          Distribute
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Distribute Product To Store</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Select Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Store</Label>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity in Number</Label>
            <Input
              type="number"
              step="1"
              min="0"
              value={quantityNumber}
              onChange={(event) => setQuantityNumber(event.target.value)}
              placeholder="Enter quantity in number"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Measurement Unit</Label>
              <Select
                value={measurementUnit}
                onValueChange={(value) =>
                  setMeasurementUnit(value as InventoryMeasurementUnit)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ratti">Ratti</SelectItem>
                  <SelectItem value="carat">Carat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Quantity in {measurementUnit === "ratti" ? "Ratti" : "Carat"}
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={measuredQuantity}
                onChange={(event) => setMeasuredQuantity(event.target.value)}
                placeholder={`Enter quantity in ${measurementUnit}`}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!productId || !storeId || !quantityNumber || !measuredQuantity}
          >
            Save Distribution
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
