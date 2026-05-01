"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ProductListItem } from "@/types/product";
import { StoreListItem } from "@/types/store";
import { inventoryService } from "@/services/inventory.service";
import { QUERY_KEYS } from "@/constants/query_keys";

type InventoryDistributeDialogProps = {
  products?: ProductListItem[];
  stores: StoreListItem[];
};

export default function InventoryDistributeDialog({
  products = [],
  stores,
}: InventoryDistributeDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [weight, setWeight] = useState("");
  const [stoneCount, setStoneCount] = useState("");
  const [stoneWeight, setStoneWeight] = useState("");
  const [notes, setNotes] = useState("");

  const allocateMutation = useMutation({
    mutationFn: inventoryService.allocate,
    onSuccess: async () => {
      toast.success("Inventory allocated successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] }),
        queryClient.invalidateQueries({ queryKey: ["central-inventory-products"] }),
        queryClient.invalidateQueries({ queryKey: ["central-inventory-list"] }),
      ]);
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to allocate inventory.";
      if (message.toLowerCase().includes("centralinventory")) {
        toast.error("This product has no stock in Central Inventory yet.");
        return;
      }
      toast.error(message);
    },
  });

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
    setWeight("");
    setStoneCount("");
    setStoneWeight("");
    setNotes("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    allocateMutation.mutate({
      productId,
      storeId,
      weight: Number(weight),
      stoneCount: stoneCount ? Number(stoneCount) : undefined,
      stoneWeight: stoneWeight ? Number(stoneWeight) : undefined,
      notes: notes.trim() || undefined,
    });
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
                    {product.name} {typeof product.availableWeight === "number" ? `(${product.availableWeight} wt)` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {productOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No products currently have stock in Central Inventory. Receive stock in central inventory first, then distribute it to stores.
              </p>
            ) : null}
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
            <Label>Weight</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="Enter allocated weight"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Stone Count</Label>
              <Input
                type="number"
                step="1"
                min="0"
                value={stoneCount}
                onChange={(event) => setStoneCount(event.target.value)}
                placeholder="Optional stone count"
              />
            </div>

            <div className="space-y-2">
              <Label>Stone Weight</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={stoneWeight}
                onChange={(event) => setStoneWeight(event.target.value)}
                placeholder="Optional stone weight"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!productId || !storeId || !weight || allocateMutation.isPending}
          >
            {allocateMutation.isPending ? "Saving..." : "Save Distribution"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
