"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Eye } from "lucide-react";
import { QUERY_KEYS } from "@/constants/query_keys";
import { getUser } from "@/services/session.service";
import { normalizeRole } from "@/lib/auth";
import { UserRole } from "@/types";
import { refundService } from "@/services/refund.service";
import { RefundListItem } from "@/types/refund";
import { formatOrderCurrency, formatOrderDate } from "@/app/Dashboard/Orders/_utils/order.utils";
import { toast } from "sonner";

const getRefundStatusClasses = (status: string) => {
  if (status === "COMPLETED" || status === "APPROVED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "REJECTED") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

export default function RefundDetailsDialog({
  refund,
  trigger,
}: {
  refund: RefundListItem;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const role = normalizeRole(getUser()?.role);
  const canReview =
    role === UserRole.SUPER_ADMIN || role === UserRole.STORE_ADMIN;

  const refundDetailsQuery = useQuery({
    queryKey: [QUERY_KEYS.REFUNDS, "detail", refund.id],
    queryFn: () => refundService.getById(refund.id),
    enabled: open,
  });

  const resolvedRefund = refundDetailsQuery.data?.data ?? null;

  const reviewMutation = useMutation({
    mutationFn: async (action: "approve" | "reject") =>
      action === "approve"
        ? refundService.approve(refund.id, notes.trim() || undefined)
        : refundService.reject(refund.id, notes.trim() || undefined),
    onSuccess: async (_, action) => {
      toast.success(action === "approve" ? "Refund approved." : "Refund rejected.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REFUNDS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] }),
      ]);
      refundDetailsQuery.refetch();
      setNotes("");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Refund update failed.");
    },
  });

  const fallbackTrigger = useMemo(
    () => (
      <Button size="icon" variant="ghost">
        <Eye className="h-4 w-4" />
      </Button>
    ),
    [],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? fallbackTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <DialogTitle>Refund {refund.refundNumber}</DialogTitle>
                  <DialogDescription>
                    Refund details, invoice linkage, and approval workflow.
                  </DialogDescription>
                </div>
                <Badge variant="outline" className={getRefundStatusClasses(refund.status)}>
                  {refund.status}
                </Badge>
              </div>
            </DialogHeader>

            {refundDetailsQuery.isLoading ? (
              <div className="mt-6 text-sm text-muted-foreground">Loading refund details...</div>
            ) : refundDetailsQuery.isError ? (
              <div className="mt-6 text-sm text-destructive">
                {refundDetailsQuery.error instanceof Error
                  ? refundDetailsQuery.error.message
                  : "Failed to load refund details."}
              </div>
            ) : resolvedRefund ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <section className="rounded-lg border p-4">
                    <h3 className="text-sm font-semibold">Refund Summary</h3>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">RFID:</span> {resolvedRefund.rfid}</p>
                      <p><span className="font-medium text-foreground">Returned Weight:</span> {resolvedRefund.returnedWeight.toFixed(3)} g</p>
                      <p><span className="font-medium text-foreground">Actual Weight:</span> {resolvedRefund.actualWeight.toFixed(3)} g</p>
                      <p><span className="font-medium text-foreground">Deviation:</span> {resolvedRefund.weightDeviation.toFixed(3)} g</p>
                      <p><span className="font-medium text-foreground">Amount:</span> {formatOrderCurrency(resolvedRefund.refundAmount)}</p>
                    </div>
                  </section>

                  <section className="rounded-lg border p-4">
                    <h3 className="text-sm font-semibold">Invoice Context</h3>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Invoice:</span> {resolvedRefund.invoiceNumber}</p>
                      <p><span className="font-medium text-foreground">Store:</span> {resolvedRefund.storeName}</p>
                      <p><span className="font-medium text-foreground">Created:</span> {formatOrderDate(resolvedRefund.createdAt)}</p>
                      <p><span className="font-medium text-foreground">Approved:</span> {resolvedRefund.approvedAt ? formatOrderDate(resolvedRefund.approvedAt) : "Not approved"}</p>
                    </div>
                  </section>

                  <section className="rounded-lg border p-4">
                    <h3 className="text-sm font-semibold">Workflow</h3>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Created By:</span> {resolvedRefund.createdBy}</p>
                      <p><span className="font-medium text-foreground">Approved By:</span> {resolvedRefund.approvedBy || "Pending"}</p>
                      <p><span className="font-medium text-foreground">Auto Approved:</span> {resolvedRefund.isAutoApproved ? "Yes" : "No"}</p>
                      <p><span className="font-medium text-foreground">Tolerance:</span> {resolvedRefund.weightTolerance?.toFixed(3) ?? "N/A"} g</p>
                    </div>
                  </section>
                </div>

                {(resolvedRefund.reason || resolvedRefund.approvalNotes) && (
                  <section className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-semibold">Reason</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {resolvedRefund.reason || "No reason provided."}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-semibold">Approval Notes</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {resolvedRefund.approvalNotes || "No approval notes."}
                      </p>
                    </div>
                  </section>
                )}

                <section className="rounded-lg border">
                  <div className="border-b px-4 py-3 font-medium">Invoice Items</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40 text-left">
                          <th className="px-4 py-3 font-medium">Product</th>
                          <th className="px-4 py-3 font-medium">RFID</th>
                          <th className="px-4 py-3 text-right font-medium">Weight</th>
                          <th className="px-4 py-3 text-right font-medium">Stone Wt.</th>
                          <th className="px-4 py-3 font-medium">Returned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resolvedRefund.invoiceItems.map((item) => (
                          <tr key={item.id} className="border-b last:border-b-0">
                            <td className="px-4 py-3">
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">{item.sku}</p>
                            </td>
                            <td className="px-4 py-3">{item.rfid}</td>
                            <td className="px-4 py-3 text-right">{item.actualWeight.toFixed(3)} g</td>
                            <td className="px-4 py-3 text-right">{item.stoneWeight.toFixed(3)} g</td>
                            <td className="px-4 py-3">{item.isReturned ? "Yes" : "No"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {canReview && resolvedRefund.status === "PENDING" && (
                  <section className="rounded-lg border p-4 space-y-3">
                    <h3 className="text-sm font-semibold">Review Refund</h3>
                    <Textarea
                      rows={3}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Optional approval or rejection notes"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => reviewMutation.mutate("reject")}
                        disabled={reviewMutation.isPending}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => reviewMutation.mutate("approve")}
                        disabled={reviewMutation.isPending}
                      >
                        Approve
                      </Button>
                    </div>
                  </section>
                )}
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
