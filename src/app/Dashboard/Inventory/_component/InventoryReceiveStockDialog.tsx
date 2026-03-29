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
import { PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { ProductListItem } from "@/types/product";
import { inventoryService } from "@/services/inventory.service";
import { QUERY_KEYS } from "@/constants/query_keys";

type InventoryReceiveStockDialogProps = {
  products?: ProductListItem[];
};

export default function InventoryReceiveStockDialog({
  products = [],
}: InventoryReceiveStockDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [totalWeight, setTotalWeight] = useState("");
  const [totalStones, setTotalStones] = useState("");
  const [stoneWeight, setStoneWeight] = useState("");
  const [notes, setNotes] = useState("");

  const receiveStockMutation = useMutation({
    mutationFn: inventoryService.receiveCentralStock,
    onSuccess: async () => {
      toast.success("Central stock received successfully.");
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
          : "Failed to receive central stock.";
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
    setTotalWeight("");
    setTotalStones("");
    setStoneWeight("");
    setNotes("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    receiveStockMutation.mutate({
      productId,
      totalWeight: Number(totalWeight),
      totalStones: totalStones ? Number(totalStones) : undefined,
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
        <Button>
          <PackagePlus className="mr-2 h-4 w-4" />
          Receive Stock
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Central Inventory Stock</DialogTitle>
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
            <Label>Total Weight</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={totalWeight}
              onChange={(event) => setTotalWeight(event.target.value)}
              placeholder="Enter total weight"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Total Stones</Label>
              <Input
                type="number"
                step="1"
                min="0"
                value={totalStones}
                onChange={(event) => setTotalStones(event.target.value)}
                placeholder="Optional total stones"
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
            disabled={!productId || !totalWeight || receiveStockMutation.isPending}
          >
            {receiveStockMutation.isPending ? "Saving..." : "Add Stock"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
