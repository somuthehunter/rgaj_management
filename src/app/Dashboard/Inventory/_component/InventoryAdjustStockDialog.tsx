"use client";

import { ReactNode, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
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
import { inventoryService } from "@/services/inventory.service";
import { QUERY_KEYS } from "@/constants/query_keys";

type InventoryAdjustStockDialogProps = {
  productId: string;
  productName: string;
  trigger?: ReactNode;
};

export default function InventoryAdjustStockDialog({
  productId,
  productName,
  trigger,
}: InventoryAdjustStockDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [weightDelta, setWeightDelta] = useState("");
  const [notes, setNotes] = useState("");

  const detailsQuery = useQuery({
    queryKey: ["central-inventory-detail", productId],
    queryFn: () => inventoryService.getCentralInventoryByProduct(productId),
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      setWeightDelta("");
      setNotes("");
    }
  }, [open]);

  const adjustMutation = useMutation({
    mutationFn: () =>
      inventoryService.adjustCentralStock(productId, {
        weightDelta: Number(weightDelta),
        notes: notes.trim() || undefined,
      }),
    onSuccess: async () => {
      toast.success("Central stock adjusted successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["central-inventory-list"] }),
        queryClient.invalidateQueries({ queryKey: ["central-inventory-detail", productId] }),
        queryClient.invalidateQueries({ queryKey: ["central-inventory-products"] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] }),
      ]);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to adjust stock.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Adjust
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Central Stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="font-medium">{productName}</p>
            {detailsQuery.isLoading ? (
              <p className="mt-1 text-muted-foreground">Loading stock details...</p>
            ) : detailsQuery.data?.data ? (
              <div className="mt-2 space-y-1 text-muted-foreground">
                <p>
                  Available: {detailsQuery.data.data.availableWeight.toFixed(3)}{" "}
                  {detailsQuery.data.data.weightUnit}
                </p>
                <p>
                  Total: {detailsQuery.data.data.totalWeight.toFixed(3)}{" "}
                  {detailsQuery.data.data.weightUnit}
                </p>
                <p>
                  Reserved: {detailsQuery.data.data.reservedWeight.toFixed(3)}{" "}
                  {detailsQuery.data.data.weightUnit}
                </p>
              </div>
            ) : null}
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              adjustMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Weight Delta</Label>
              <Input
                type="number"
                step="0.01"
                value={weightDelta}
                onChange={(event) => setWeightDelta(event.target.value)}
                placeholder="Use positive to add, negative to reduce"
              />
              <p className="text-xs text-muted-foreground">
                Example: `5` adds stock, `-2.5` reduces stock.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional adjustment note"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!weightDelta || adjustMutation.isPending}
            >
              {adjustMutation.isPending ? "Saving..." : "Save Adjustment"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
