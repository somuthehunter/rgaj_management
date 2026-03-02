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
import { Trash2, RotateCcw } from "lucide-react";

export default function ProductTable({
  products,
  isAdmin,
  onDelete,
  onReturn,
}: any) {
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
        {products?.map((product: any) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.sku}</TableCell>
            <TableCell>
              <Badge variant="outline">{product.category}</Badge>
            </TableCell>
            <TableCell>₹{product.price}</TableCell>
            <TableCell>{product.quantity}</TableCell>
            <TableCell>
              <div className="flex gap-2">
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
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}