"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { OrderListItem } from "@/types/order";
import { buildOrderBillMarkup, formatOrderCurrency, formatOrderDate } from "@/app/Dashboard/Orders/_utils/order.utils";
import OrderDetailsDialog from "@/app/Dashboard/Orders/_component/OrderDetailsDialog";

type GeneratedBillCardProps = {
  order: OrderListItem | null;
};

export default function GeneratedBillCard({ order }: GeneratedBillCardProps) {
  const downloadBill = () => {
    if (!order) return;

    const blob = new Blob([buildOrderBillMarkup(order)], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${order.orderNumber.toLowerCase()}-bill.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  if (!order) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Bill</CardTitle>
          <CardDescription>
            Once you generate an order, the bill preview and download actions will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">Order {order.orderNumber}</CardTitle>
            <CardDescription>
              Bill generated successfully for {order.customer.name}.
            </CardDescription>
          </div>
          <Badge variant="outline">{order.paymentMethod.replaceAll("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="mt-1 font-medium">{order.customer.name}</p>
            <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Order Total</p>
            <p className="mt-1 font-medium">{formatOrderCurrency(order.total)}</p>
            <p className="text-sm text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <OrderDetailsDialog
            order={order}
            trigger={<Button variant="outline">View Full Bill</Button>}
          />
          <Button onClick={downloadBill}>
            <Download className="mr-2 h-4 w-4" />
            Download Bill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
