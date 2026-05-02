"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { QUERY_TIMINGS } from "@/constants/query_options";
import { inventoryService } from "@/services/inventory.service";
import { productService } from "@/services/product.service";
import { QUERY_KEYS } from "@/constants/query_keys";

export default function InventoryReceiveStockDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [totalWeight, setTotalWeight] = useState("");
  const [totalStones, setTotalStones] = useState("");
  const [notes, setNotes] = useState("");

  const productsQuery = useQuery({
    queryKey: ["receive-stock-products"],
    queryFn: async () => {
      const res = await productService.getAll({ page: 1, limit: 100, isActive: true });
      return res.data;
    },
    enabled: open,
    staleTime: QUERY_TIMINGS.DETAIL_STALE_MS,
    gcTime: QUERY_TIMINGS.DETAIL_STALE_MS * 2,
    refetchOnMount: false,
  });

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
      (productsQuery.data ?? []).filter(
        (product) =>
          product.id &&
          product.name &&
          (product.isActive ?? product.active ?? true),
      ),
    [productsQuery.data],
  );
  const selectedProduct = productOptions.find((product) => product.id === productId);

  const resetForm = () => {
    setProductId("");
    setTotalWeight("");
    setTotalStones("");
    setNotes("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedWeight = Number(totalWeight);
    const parsedStones = totalStones ? Number(totalStones) : undefined;

    if (!productId) {
      toast.error("Select a product first.");
      return;
    }

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      toast.error("Enter a valid total weight.");
      return;
    }

    if (
      parsedStones !== undefined &&
      (!Number.isInteger(parsedStones) || parsedStones < 0)
    ) {
      toast.error("Total stones must be a whole number.");
      return;
    }

    receiveStockMutation.mutate({
      productId,
      totalWeight: parsedWeight,
      totalStones: parsedStones,
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
        <Button disabled={receiveStockMutation.isPending}>
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
            {selectedProduct ? (
              <p className="text-xs text-muted-foreground">
                Weight unit: {selectedProduct.weightUnit}
              </p>
            ) : null}
          </div>

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
