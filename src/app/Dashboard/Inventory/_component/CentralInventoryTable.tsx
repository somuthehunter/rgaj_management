"use client";

import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { CentralInventoryListItem } from "@/services/inventory.service";

type CentralInventoryTableProps = {
  inventory?: CentralInventoryListItem[];
};

export default function CentralInventoryTable({
  inventory,
}: CentralInventoryTableProps) {
  const columns: DataTableColumn<CentralInventoryListItem>[] = [
    {
      id: "product",
      header: "Product",
      cell: (row) => row.productName,
    },
    {
      id: "sku",
      header: "SKU",
      cell: (row) => row.productSku,
    },
    {
      id: "category",
      header: "Category",
      cell: (row) => <Badge variant="outline">{row.category}</Badge>,
    },
    {
      id: "total-weight",
      header: "Total Weight",
      cell: (row) => row.totalWeight,
    },
    {
      id: "available-weight",
      header: "Available Weight",
      cell: (row) => row.availableWeight,
    },
    {
      id: "total-stones",
      header: "Stones",
      cell: (row) => row.totalStones,
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[860px]">
        <DataTable
          data={inventory}
          columns={columns}
          getRowKey={(row) => row.id}
          emptyMessage="No central inventory found."
        />
      </div>
    </div>
  );
}
