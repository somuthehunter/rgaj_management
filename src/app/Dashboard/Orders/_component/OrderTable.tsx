"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { OrderRow, OrderTableProps } from "../_types/order-table.types";
import OrderDetailsDialog from "./OrderDetailsDialog";
import { orderService } from "@/services/order.service";
import {
  buildOrderBillMarkup,
  formatOrderCurrency,
  formatOrderDate,
  getOrderItemsCount,
  getOrderStatusClasses,
} from "../_utils/order.utils";

const downloadOrderBill = async (order: OrderRow) => {
  const detailedOrder =
    order.items.length > 0 ? order : (await orderService.getById(order.id)).data;
  const markup = buildOrderBillMarkup(detailedOrder);
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

export default function OrderTable({ orders }: OrderTableProps) {
  const columns: DataTableColumn<OrderRow>[] = [
    {
      id: "order-id",
      header: "Order ID",
      cell: (order) => (
        <div>
          <p className="font-medium">{order.orderNumber}</p>
          <p className="text-xs text-muted-foreground">{order.customer.name}</p>
        </div>
      ),
    },
    {
      id: "store-name",
      header: "Store Name",
      cell: (order) => order.storeName,
    },
    {
      id: "items",
      header: "Items",
      cell: (order) => <Badge variant="outline">{getOrderItemsCount(order)}</Badge>,
    },
    {
      id: "total",
      header: "Total",
      cell: (order) => formatOrderCurrency(order.total),
    },
    {
      id: "status",
      header: "Status",
      cell: (order) => (
        <Badge variant="outline" className={getOrderStatusClasses(order.status)}>
          {order.status}
        </Badge>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: (order) => formatOrderDate(order.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (order) => (
        <div className="flex gap-2">
          <OrderDetailsDialog order={order} />
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              try {
                await downloadOrderBill(order);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to download bill.",
                );
              }
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[840px]">
        <DataTable
          data={orders}
          columns={columns}
          getRowKey={(order) => order.id}
          emptyMessage="No orders found."
        />
      </div>
    </div>
  );
}
