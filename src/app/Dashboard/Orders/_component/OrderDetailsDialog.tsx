"use client";

import { useMemo, useState } from "react";
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

  const fallbackTrigger = useMemo(
    () => (
      <Button size="icon" variant="ghost">
        <Eye className="h-4 w-4" />
      </Button>
    ),
    [],
  );

  const handleDownloadBill = () => {
    const markup = buildOrderBillMarkup(order);
    const blob = new Blob([markup], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${order.orderNumber.toLowerCase()}-bill.html`;
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
                  <DialogTitle>Order {order.orderNumber}</DialogTitle>
                  <DialogDescription>
                    Full order summary, customer details, item breakdown, and bill download.
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getOrderStatusClasses(order.status)}
                  >
                    {order.status}
                  </Badge>
                  <Button variant="outline" onClick={handleDownloadBill}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Bill
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Customer Details</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Name:</span>{" "}
                    {order.customer.name}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Phone:</span>{" "}
                    {order.customer.phone}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Email:</span>{" "}
                    {order.customer.email || "Not provided"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Address:</span>{" "}
                    {order.customer.address || "Not provided"}
                  </p>
                </div>
              </section>

              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Order Details</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Store:</span>{" "}
                    {order.storeName}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Placed On:</span>{" "}
                    {formatOrderDate(order.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Items:</span>{" "}
                    {getOrderItemsCount(order)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Payment:</span>{" "}
                    {order.paymentMethod.replaceAll("_", " ")}
                  </p>
                </div>
              </section>

              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Price Breakdown</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatOrderCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>{formatOrderCurrency(order.tax)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2 font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatOrderCurrency(order.total)}</span>
                  </div>
                </div>
              </section>
            </div>

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
                    {order.items.map((item) => (
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

            {order.notes && (
              <section className="mt-6 rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Notes</h3>
                <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
