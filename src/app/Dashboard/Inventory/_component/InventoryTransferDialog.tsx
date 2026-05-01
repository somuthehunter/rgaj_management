"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
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
import { InventoryListItem } from "@/types/inventory";
import { StoreListItem } from "@/types/store";
import { inventoryService } from "@/services/inventory.service";
import { QUERY_KEYS } from "@/constants/query_keys";

type InventoryTransferDialogProps = {
  stores: StoreListItem[];
  inventory: InventoryListItem[];
};

export default function InventoryTransferDialog({
  stores,
  inventory,
}: InventoryTransferDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [fromStoreId, setFromStoreId] = useState("");
  const [toStoreId, setToStoreId] = useState("");
  const [productId, setProductId] = useState("");
  const [weight, setWeight] = useState("");

  const sourceProducts = useMemo(
    () =>
      inventory.filter(
        (item) =>
          item.storeId === fromStoreId &&
          item.measuredQuantity > 0 &&
          (!toStoreId || item.storeId !== toStoreId),
      ),
    [fromStoreId, inventory, toStoreId],
  );

  const transferMutation = useMutation({
    mutationFn: () =>
      inventoryService.transfer({
        fromStoreId,
        toStoreId,
        productId,
        weight: Number(weight),
      }),
    onSuccess: async () => {
      toast.success("Inventory transferred successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-ledger"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-ledger-summary"] }),
      ]);
      setOpen(false);
      setFromStoreId("");
      setToStoreId("");
      setProductId("");
      setWeight("");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to transfer inventory.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Transfer
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Stock Between Stores</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4 pt-2"
          onSubmit={(event) => {
            event.preventDefault();
            transferMutation.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>From Store</Label>
              <Select
                value={fromStoreId}
                onValueChange={(value) => {
                  setFromStoreId(value);
                  setProductId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source store" />
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
              <Label>To Store</Label>
              <Select value={toStoreId} onValueChange={setToStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination store" />
                </SelectTrigger>
                <SelectContent>
                  {stores
                    .filter((store) => store.id !== fromStoreId)
                    .map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId} disabled={!fromStoreId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product to move" />
              </SelectTrigger>
              <SelectContent>
                {sourceProducts.map((item) => (
                  <SelectItem key={`${item.storeId}-${item.productId}`} value={item.productId}>
                    {item.productName} ({item.measuredQuantity.toFixed(3)} g)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Weight</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="Weight to transfer"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!fromStoreId || !toStoreId || !productId || !weight || transferMutation.isPending}
          >
            {transferMutation.isPending ? "Transferring..." : "Transfer Stock"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
