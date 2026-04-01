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
import { Download, Eye } from "lucide-react";
import { OrderListItem } from "@/types/order";
import { orderService } from "@/services/order.service";
import { QUERY_KEYS } from "@/constants/query_keys";
import { getUser } from "@/services/session.service";
import { normalizeRole } from "@/lib/auth";
import { UserRole } from "@/types";
import { toast } from "sonner";
import {
  buildOrderBillMarkup,
  formatOrderCurrency,
  formatOrderDate,
  getOrderItemsCount,
  getOrderStatusClasses,
} from "../_utils/order.utils";

type OrderDetailsDialogProps = {
  order: OrderListItem;
  trigger?: React.ReactNode;
};

export default function OrderDetailsDialog({
  order,
  trigger,
}: OrderDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const user = getUser();
  const role = normalizeRole(user?.role);
  const canCancel =
    (role === UserRole.SUPER_ADMIN || role === UserRole.STORE_ADMIN) &&
    order.status !== "CANCELLED";

  const orderDetailsQuery = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, "detail", order.id],
    queryFn: () => orderService.getById(order.id),
    enabled: open,
  });

  const resolvedOrder = orderDetailsQuery.data?.data ?? order;

  const cancelOrderMutation = useMutation({
    mutationFn: () => orderService.cancel(order.id),
    onSuccess: async () => {
      toast.success(`Order ${resolvedOrder.orderNumber} cancelled.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] }),
      ]);
      orderDetailsQuery.refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel invoice.",
      );
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

  const handleDownloadBill = () => {
    const markup = buildOrderBillMarkup(resolvedOrder);
    const blob = new Blob([markup], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${resolvedOrder.orderNumber.toLowerCase()}-bill.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? fallbackTrigger}</DialogTrigger>

      <DialogContent className="max-w-4xl p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <DialogTitle>Order {resolvedOrder.orderNumber}</DialogTitle>
                  <DialogDescription>
                    Full order summary, customer details, item breakdown, and bill download.
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getOrderStatusClasses(resolvedOrder.status)}
                  >
                    {resolvedOrder.status}
                  </Badge>
                  {canCancel && (
                    <Button
                      variant="outline"
                      onClick={() => cancelOrderMutation.mutate()}
                      disabled={cancelOrderMutation.isPending}
                    >
                      {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleDownloadBill}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Bill
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {orderDetailsQuery.isLoading ? (
              <div className="mt-6 text-sm text-muted-foreground">Loading order details...</div>
            ) : orderDetailsQuery.isError ? (
              <div className="mt-6 text-sm text-destructive">
                {orderDetailsQuery.error instanceof Error
                  ? orderDetailsQuery.error.message
                  : "Failed to load order details."}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Customer Details</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Name:</span>{" "}
                    {resolvedOrder.customer.name}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Phone:</span>{" "}
                    {resolvedOrder.customer.phone}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Email:</span>{" "}
                    {resolvedOrder.customer.email || "Not provided"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Address:</span>{" "}
                    {resolvedOrder.customer.address || "Not provided"}
                  </p>
                </div>
              </section>

              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Order Details</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Store:</span>{" "}
                    {resolvedOrder.storeName}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Placed On:</span>{" "}
                    {formatOrderDate(resolvedOrder.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Items:</span>{" "}
                    {getOrderItemsCount(resolvedOrder)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Payment:</span>{" "}
                    {resolvedOrder.paymentMethod.replaceAll("_", " ")}
                  </p>
                </div>
              </section>

              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Price Breakdown</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatOrderCurrency(resolvedOrder.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>{formatOrderCurrency(resolvedOrder.tax)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2 font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatOrderCurrency(resolvedOrder.total)}</span>
                  </div>
                </div>
              </section>
              </div>
            )}

            <section className="mt-6 rounded-lg border">
              <div className="border-b px-4 py-3">
                <h3 className="text-sm font-semibold">Ordered Items</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">SKU</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 text-right font-medium">Qty</th>
                      <th className="px-4 py-3 text-right font-medium">Rate</th>
                      <th className="px-4 py-3 text-right font-medium">Tax</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolvedOrder.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="px-4 py-3">{item.productName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.sku}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{item.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">
                          {formatOrderCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right">{item.taxRate}%</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatOrderCurrency(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {resolvedOrder.notes && (
              <section className="mt-6 rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Notes</h3>
                <p className="mt-2 text-sm text-muted-foreground">{resolvedOrder.notes}</p>
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
