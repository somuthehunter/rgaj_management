"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUERY_KEYS } from "@/constants/query_keys";
import { refundService } from "@/services/refund.service";
import { OrderLineItem } from "@/types/order";
import { toast } from "sonner";

type RefundableItem = Pick<OrderLineItem, "id" | "productName" | "rfid" | "actualWeight" | "isReturned">;

export default function CreateRefundDialog({
  trigger,
  items = [],
}: {
  trigger?: React.ReactNode;
  items?: RefundableItem[];
}) {
  const [open, setOpen] = useState(false);
  const [rfid, setRfid] = useState("");
  const [returnedWeight, setReturnedWeight] = useState("");
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const refundableItems = useMemo(
    () => items.filter((item) => item.rfid && !item.isReturned),
    [items],
  );

  const selectedItem = refundableItems.find((item) => item.rfid === rfid);

  const createRefundMutation = useMutation({
    mutationFn: () =>
      refundService.create({
        rfid,
        returnedWeight: Number(returnedWeight),
        reason: reason.trim() || undefined,
      }),
    onSuccess: async (result) => {
      toast.success(`Refund ${result.data.refundNumber} created successfully.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REFUNDS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] }),
      ]);
      setOpen(false);
      setRfid("");
      setReturnedWeight("");
      setReason("");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create refund.",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Create Refund</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Refund</DialogTitle>
          <DialogDescription>
            Select an invoiced RFID item and submit the returned weight for refund processing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {refundableItems.length > 0 ? (
            <div className="space-y-2">
              <Label>RFID Item</Label>
              <Select value={rfid} onValueChange={setRfid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select refunded item" />
                </SelectTrigger>
                <SelectContent>
                  {refundableItems.map((item) => (
                    <SelectItem key={item.id} value={item.rfid ?? item.id}>
                      {item.productName} ({item.rfid})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="refund-rfid">RFID</Label>
              <Input
                id="refund-rfid"
                value={rfid}
                onChange={(event) => setRfid(event.target.value)}
                placeholder="Enter RFID"
              />
            </div>
          )}

          {selectedItem && (
            <p className="text-xs text-muted-foreground">
              Original item weight: {(selectedItem.actualWeight ?? 0).toFixed(3)} g
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="returned-weight">Returned Weight</Label>
            <Input
              id="returned-weight"
              type="number"
              min="0.001"
              step="0.001"
              value={returnedWeight}
              onChange={(event) => setReturnedWeight(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-reason">Reason</Label>
            <Textarea
              id="refund-reason"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Optional reason for refund"
            />
          </div>

          {refundableItems.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Enter an RFID manually if you are creating a refund outside the order flow.
            </p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => createRefundMutation.mutate()}
              disabled={
                createRefundMutation.isPending ||
                !rfid ||
                !Number(returnedWeight)
              }
            >
              {createRefundMutation.isPending ? "Creating..." : "Submit Refund"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
