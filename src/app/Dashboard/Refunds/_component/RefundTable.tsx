"use client";

import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { RefundListItem } from "@/types/refund";
import { formatOrderCurrency, formatOrderDate } from "@/app/Dashboard/Orders/_utils/order.utils";
import RefundDetailsDialog from "./RefundDetailsDialog";

const getRefundStatusClasses = (status: string) => {
  if (status === "COMPLETED" || status === "APPROVED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "REJECTED") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

export default function RefundTable({ refunds }: { refunds?: RefundListItem[] }) {
  const columns: DataTableColumn<RefundListItem>[] = [
    {
      id: "refund-number",
      header: "Refund",
      cell: (refund) => (
        <div>
          <p className="font-medium">{refund.refundNumber}</p>
          <p className="text-xs text-muted-foreground">{refund.invoiceNumber}</p>
        </div>
      ),
    },
    {
      id: "rfid",
      header: "RFID",
      cell: (refund) => refund.rfid,
    },
    {
      id: "store",
      header: "Store",
      cell: (refund) => refund.storeName,
    },
    {
      id: "amount",
      header: "Amount",
      cell: (refund) => formatOrderCurrency(refund.refundAmount),
    },
    {
      id: "status",
      header: "Status",
      cell: (refund) => (
        <Badge variant="outline" className={getRefundStatusClasses(refund.status)}>
          {refund.status}
        </Badge>
      ),
    },
    {
      id: "created-at",
      header: "Created",
      cell: (refund) => formatOrderDate(refund.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (refund) => <RefundDetailsDialog refund={refund} />,
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[920px]">
        <DataTable
          data={refunds}
          columns={columns}
          getRowKey={(refund) => refund.id}
          emptyMessage="No refunds found."
        />
      </div>
    </div>
  );
}
