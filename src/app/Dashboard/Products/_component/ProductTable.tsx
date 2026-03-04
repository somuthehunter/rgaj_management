"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {products?.map((product: ProductRow) => {
          const active = isProductActive(product);

          return (
            <TableRow key={product.id} className={!active ? "opacity-55" : ""}>
              <TableCell className={!active ? "line-through" : ""}>
                {product.name}
              </TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{product.category}</Badge>
                  {!active && <Badge variant="secondary">Deactivated</Badge>}
                </div>
              </TableCell>
              <TableCell>Rs. {product.price}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
