"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { CustomerRow, CustomerTableProps } from "../_types/customer-table.types";
import CustomerDetailsDialog from "./CustomerDetailsDialog";
import { formatOrderCurrency } from "@/app/Dashboard/Orders/_utils/order.utils";
import {
  downloadCustomerLatestBill,
} from "../_utils/customer.utils";

export default function CustomerTable({ customers }: CustomerTableProps) {
  const columns: DataTableColumn<CustomerRow>[] = [
    {
      id: "name",
      header: "Name",
      cell: (customer) => (
        <div>
          <p className="font-medium">{customer.name}</p>
          <p className="text-xs text-muted-foreground">
            {customer.ordersCount} order{customer.ordersCount > 1 ? "s" : ""}
          </p>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone Number",
      cell: (customer) => customer.phone,
    },
    {
      id: "purchase",
      header: "Total Purchase",
      cell: (customer) => formatOrderCurrency(customer.totalPurchase),
    },
    {
      id: "items",
      header: "Items Purchased",
      cell: (customer) => <Badge variant="outline">{customer.itemsPurchased}</Badge>,
    },
    {
      id: "store",
      header: "Store",
      cell: (customer) => customer.primaryStoreName,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (customer) => (
        <div className="flex gap-2">
          <CustomerDetailsDialog customer={customer} />
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              try {
                await downloadCustomerLatestBill(customer);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to download latest bill.",
                );
              }
            }}
            title="Download latest bill"
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
          data={customers}
          columns={columns}
          getRowKey={(customer) => customer.id}
          emptyMessage="No customers found."
        />
      </div>
    </div>
  );
}
