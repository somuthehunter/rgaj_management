"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Pencil, Ban, CheckCircle2 } from "lucide-react";
import AddProductDialog from "./AddProductDialog";
import { isProductActive } from "../_utils/product.utils";
import { ProductRow, ProductTableProps } from "../_types/product-table.types";
import { formatOrderCurrency } from "@/app/Dashboard/Orders/_utils/order.utils";

export default function ProductTable({
  products,
  canManageStatus,
  canEdit,
  onDeactivate,
  onActivate,
}: ProductTableProps) {
  const columns: DataTableColumn<ProductRow>[] = [
    {
      id: "name",
      header: "Name",
      cell: (product) => {
        const active = isProductActive(product);

        return (
          <span className={!active ? "line-through" : undefined}>
            {product.name}
          </span>
        );
      },
    },
    {
      id: "sku",
      header: "SKU",
      cell: (product) => product.sku,
    },
    {
      id: "category",
      header: "Category",
      cell: (product) => {
        const active = isProductActive(product);

        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{product.categoryName}</Badge>
            {!active && <Badge variant="secondary">Deactivated</Badge>}
          </div>
        );
      },
    },
    {
      id: "unit",
      header: "Weight Unit",
      cell: (product) => product.weightUnit,
    },
    {
      id: "price",
      header: "Price / Unit",
      cell: (product) => formatOrderCurrency(product.pricePerUnit),
    },
    {
      id: "tax",
      header: "GST",
      cell: (product) => `${product.gstRate ?? 0}%`,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (product) => {
        const active = isProductActive(product);

        return (
          <div className="flex gap-2">
            {canEdit ? (
              <AddProductDialog
                mode="edit"
                product={product}
                trigger={
                  <Button size="icon" variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                }
              />
            ) : null}
            {canManageStatus ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  active
                    ? onDeactivate(product.id)
                    : onActivate(product.id)
                }
              >
                {active ? (
                  <Ban className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
              </Button>
            ) : null}
            {!canEdit && !canManageStatus ? (
              <span className="text-xs text-muted-foreground">View only</span>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[860px]">
        <DataTable
          data={products}
          columns={columns}
          getRowKey={(product) => product.id}
          getRowClassName={(product) =>
            !isProductActive(product) ? "opacity-55" : undefined
          }
          emptyMessage="No products found."
        />
      </div>
    </div>
  );
}
