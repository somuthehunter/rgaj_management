"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Download } from "lucide-react";
import { TransactionRow, TransactionTableProps } from "../_types/transaction-table.types";
import TransactionDetailsDialog from "./TransactionDetailsDialog";
import {
  downloadTransactionSummary,
  formatTransactionDate,
  formatTransactionLabel,
  getTransactionActionClasses,
} from "../_utils/transaction.utils";

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  const columns: DataTableColumn<TransactionRow>[] = [
    {
      id: "action",
      header: "Action",
      cell: (transaction) => (
        <div>
          <Badge
            variant="outline"
            className={getTransactionActionClasses(transaction.action)}
          >
            {formatTransactionLabel(transaction.action)}
          </Badge>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatTransactionLabel(transaction.entity)}
          </p>
        </div>
      ),
    },
    {
      id: "entity",
      header: "Entity",
      cell: (transaction) => transaction.entity || "N/A",
    },
    {
      id: "user-id",
      header: "User ID",
      cell: (transaction) => transaction.userId,
    },
    {
      id: "date",
      header: "Date",
      cell: (transaction) => formatTransactionDate(transaction.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (transaction) => (
        <div className="flex gap-2">
          <TransactionDetailsDialog transaction={transaction} />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => downloadTransactionSummary(transaction)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[980px]">
        <DataTable
          data={transactions}
          columns={columns}
          getRowKey={(transaction) => transaction.id}
          emptyMessage="No audit logs found."
        />
      </div>
    </div>
  );
}
