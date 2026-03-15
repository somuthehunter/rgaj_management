"use client";

import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { InventoryListItem } from "@/types/inventory";

type InventoryTableProps = {
  inventory?: InventoryListItem[];
};

export default function InventoryTable({ inventory }: InventoryTableProps) {
  const columns: DataTableColumn<InventoryListItem>[] = [
    {
      id: "store",
      header: "Store",
      cell: (row) => row.storeName,
    },
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
      id: "quantity-number",
      header: "Qty Number",
      cell: (row) => row.quantityNumber,
    },
    {
      id: "measured-quantity",
      header: "Measured Qty",
      cell: (row) => `${row.measuredQuantity} ${row.measuredUnit}`,
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[860px]">
        <DataTable
          data={inventory}
          columns={columns}
          getRowKey={(row) => row.id}
          emptyMessage="No inventory found."
        />
      </div>
    </div>
  );
}
