"use client";

import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { InventorySummaryItem } from "@/types/inventory";

type InventorySummaryTableProps = {
  summary?: InventorySummaryItem[];
};

export default function InventorySummaryTable({
  summary,
}: InventorySummaryTableProps) {
  const columns: DataTableColumn<InventorySummaryItem>[] = [
    {
      id: "store",
      header: "Store",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.store.name}</p>
          <p className="text-xs text-muted-foreground">{row.store.code}</p>
        </div>
      ),
    },
    {
      id: "allocated",
      header: "Allocated",
      cell: (row) => `${row.totalAllocatedWeight.toFixed(3)} g`,
    },
    {
      id: "sold",
      header: "Sold",
      cell: (row) => `${row.totalSoldWeight.toFixed(3)} g`,
    },
    {
      id: "available",
      header: "Available",
      cell: (row) => `${row.totalAvailableWeight.toFixed(3)} g`,
    },
    {
      id: "returned",
      header: "Returned",
      cell: (row) => `${row.totalReturnedWeight.toFixed(3)} g`,
    },
    {
      id: "products",
      header: "Products",
      cell: (row) => row.productCount,
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[920px]">
        <DataTable
          data={summary}
          columns={columns}
          getRowKey={(row) => row.store.id}
          emptyMessage="No inventory summary available."
        />
      </div>
    </div>
  );
}
