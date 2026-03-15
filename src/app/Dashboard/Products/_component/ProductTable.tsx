"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { RotateCcw, Pencil, Ban, CheckCircle2 } from "lucide-react";
import AddProductDialog from "./AddProductDialog";
import { isProductActive } from "../_utils/product.utils";
import { ProductRow, ProductTableProps } from "../_types/product-table.types";

export default function ProductTable({
  products,
  isAdmin,
  onDeactivate,
  onActivate,
  onReturn,
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
            <Badge variant="outline">{product.category}</Badge>
            {!active && <Badge variant="secondary">Deactivated</Badge>}
          </div>
        );
      },
    },
    {
      id: "price",
      header: "Price",
      cell: (product) => `Rs. ${product.price}`,
    },
    {
      id: "quantity",
      header: "Qty",
      cell: (product) => product.quantity,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (product) => {
        const active = isProductActive(product);

        return (
          <div className="flex gap-2">
            <AddProductDialog
              mode="edit"
              product={product}
              trigger={
                <Button size="icon" variant="ghost">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />

            {!isAdmin && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onReturn(product.id)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

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
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      data={products}
      columns={columns}
      getRowKey={(product) => product.id}
      getRowClassName={(product) =>
        !isProductActive(product) ? "opacity-55" : undefined
      }
      emptyMessage="No products found."
    />
  );
}
