"use client";

import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { InventoryLedgerItem, InventoryLedgerSummaryItem } from "@/types/inventory";

type InventoryLedgerTableProps = {
  entries?: InventoryLedgerItem[];
  summary?: InventoryLedgerSummaryItem[];
};

export default function InventoryLedgerTable({
  entries,
  summary,
}: InventoryLedgerTableProps) {
  const columns: DataTableColumn<InventoryLedgerItem>[] = [
    {
      id: "type",
      header: "Type",
      cell: (row) => <Badge variant="outline">{row.type}</Badge>,
    },
    {
      id: "reference",
      header: "Reference",
      cell: (row) => row.reference,
    },
    {
      id: "product",
      header: "Product ID",
      cell: (row) => row.productId,
    },
    {
      id: "stores",
      header: "Movement",
      cell: (row) =>
        [row.fromStoreId || "Central", row.toStoreId || "Central"].join(" -> "),
    },
    {
      id: "weight",
      header: "Weight",
      cell: (row) => row.weight.toFixed(3),
    },
    {
      id: "net-gold",
      header: "Net Gold",
      cell: (row) => row.netGoldWeight.toFixed(3),
    },
    {
      id: "date",
      header: "Date",
      cell: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-4">
      {summary?.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => (
            <div key={item.type} className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">{item.type}</p>
              <p className="mt-1 text-lg font-semibold">{item.count}</p>
              <p className="text-xs text-muted-foreground">
                {item.totalWeight.toFixed(3)} total weight
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="w-full overflow-x-auto">
        <div className="min-w-[980px]">
          <DataTable
            data={entries}
            columns={columns}
            getRowKey={(row) => row.id}
            emptyMessage="No ledger entries found."
          />
        </div>
      </div>
    </div>
  );
}
