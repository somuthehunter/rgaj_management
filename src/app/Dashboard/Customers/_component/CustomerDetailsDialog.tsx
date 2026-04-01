"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { CustomerListItem } from "@/types/customer";
import { customerService } from "@/services/customer.service";
import { QUERY_KEYS } from "@/constants/query_keys";
import {
  formatOrderCurrency,
  formatOrderDate,
  getOrderItemsCount,
  getOrderStatusClasses,
} from "@/app/Dashboard/Orders/_utils/order.utils";
import { downloadCustomerSummary } from "../_utils/customer.utils";

type CustomerDetailsDialogProps = {
  customer: CustomerListItem;
  trigger?: React.ReactNode;
};

export default function CustomerDetailsDialog({
  customer,
  trigger,
}: CustomerDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const customerDetailsQuery = useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, "detail", customer.id],
    queryFn: () => customerService.getById(customer.id),
    enabled: open,
  });
  const resolvedCustomer = customerDetailsQuery.data?.data ?? customer;

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

      <DialogContent className="max-w-5xl p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <DialogTitle>{resolvedCustomer.name}</DialogTitle>
                  <DialogDescription>
                    Full customer profile with cumulative order history and purchase summary.
                  </DialogDescription>
                </div>

                <Button
                  variant="outline"
                  onClick={() => downloadCustomerSummary(resolvedCustomer)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Summary
                </Button>
              </div>
            </DialogHeader>

            {customerDetailsQuery.isLoading ? (
              <div className="mt-6 text-sm text-muted-foreground">Loading customer details...</div>
            ) : customerDetailsQuery.isError ? (
              <div className="mt-6 text-sm text-destructive">
                {customerDetailsQuery.error instanceof Error
                  ? customerDetailsQuery.error.message
                  : "Failed to load customer details."}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Customer Details</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Phone:</span>{" "}
                    {resolvedCustomer.phone}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Email:</span>{" "}
                    {resolvedCustomer.email || "Not provided"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Address:</span>{" "}
                    {resolvedCustomer.address || "Not provided"}
                  </p>
                </div>
              </section>

              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Purchase Summary</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Total Purchase:</span>{" "}
                    {formatOrderCurrency(resolvedCustomer.totalPurchase)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Items Purchased:</span>{" "}
                    {resolvedCustomer.itemsPurchased}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Orders Count:</span>{" "}
                    {resolvedCustomer.ordersCount}
                  </p>
                </div>
              </section>

              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Store Activity</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Primary Store:</span>{" "}
                    {resolvedCustomer.primaryStoreName || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Stores Visited:</span>{" "}
                    {resolvedCustomer.storeNames.join(", ") || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Last Order:</span>{" "}
                    {formatOrderDate(resolvedCustomer.lastOrderDate)}
                  </p>
                </div>
              </section>
              </div>
            )}

            <section className="mt-6 rounded-lg border">
              <div className="border-b px-4 py-3">
                <h3 className="text-sm font-semibold">All Orders</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Store</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Items</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolvedCustomer.orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-b-0">
                        <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                        <td className="px-4 py-3">{order.storeName}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatOrderDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3">{getOrderItemsCount(order)}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={getOrderStatusClasses(order.status)}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatOrderCurrency(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
