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
  formatTransactionEventLabel,
  getTransactionEventClasses,
} from "../_utils/transaction.utils";

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  const columns: DataTableColumn<TransactionRow>[] = [
    {
      id: "event",
      header: "Event",
      cell: (transaction) => (
        <div>
          <p className="font-medium">{transaction.title}</p>
          <p className="text-xs text-muted-foreground">
            {transaction.entityName || transaction.module}
          </p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (transaction) => (
        <Badge
          variant="outline"
          className={getTransactionEventClasses(transaction.eventType)}
        >
          {formatTransactionEventLabel(transaction.eventType)}
        </Badge>
      ),
    },
    {
      id: "actor",
      header: "Actor",
      cell: (transaction) => (
        <div>
          <p>{transaction.performedBy}</p>
          <p className="text-xs text-muted-foreground">{transaction.role}</p>
        </div>
      ),
    },
    {
      id: "store",
      header: "Store",
      cell: (transaction) => transaction.storeName || "System",
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
      <div className="min-w-[920px]">
        <DataTable
          data={transactions}
          columns={columns}
          getRowKey={(transaction) => transaction.id}
          emptyMessage="No activity logs found."
        />
      </div>
    </div>
  );
}
