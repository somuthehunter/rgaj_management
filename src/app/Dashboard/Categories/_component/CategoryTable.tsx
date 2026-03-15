"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Ban, CheckCircle2, Pencil } from "lucide-react";
import AddCategoryDialog from "./AddCategoryDialog";
import { CategoryRow, CategoryTableProps } from "../_types/category-table.types";
import { isCategoryActive } from "../_utils/category.utils";

export default function CategoryTable({
  categories,
  onDeactivate,
  onActivate,
}: CategoryTableProps) {
  const columns: DataTableColumn<CategoryRow>[] = [
    {
      id: "name",
      header: "Name",
      cell: (category) => {
        const active = isCategoryActive(category);
        return (
          <span className={!active ? "line-through" : undefined}>
            {category.name}
          </span>
        );
      },
    },
    {
      id: "slug",
      header: "Slug",
      cell: (category) => category.slug,
    },
    {
      id: "description",
      header: "Description",
      cell: (category) =>
        category.description || (
          <span className="text-muted-foreground">No description</span>
        ),
    },
    {
      id: "products",
      header: "Products",
      cell: (category) => <Badge variant="outline">{category.productCount}</Badge>,
    },
    {
      id: "status",
      header: "Status",
      cell: (category) =>
        isCategoryActive(category) ? (
          <Badge variant="outline">Active</Badge>
        ) : (
          <Badge variant="secondary">Deactivated</Badge>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (category) => {
        const active = isCategoryActive(category);

        return (
          <div className="flex gap-2">
            <AddCategoryDialog
              mode="edit"
              category={category}
              trigger={
                <Button size="icon" variant="ghost">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />

            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                active
                  ? onDeactivate(category.id)
                  : onActivate(category.id)
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
      data={categories}
      columns={columns}
      getRowKey={(category) => category.id}
      getRowClassName={(category) =>
        !isCategoryActive(category) ? "opacity-55" : undefined
      }
      emptyMessage="No categories found."
    />
  );
}
