"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Ban, CheckCircle2, Pencil } from "lucide-react";
import AddStoreDialog from "./AddStoreDialog";
import StoreDetailsDialog from "./StoreDetailsDialog";
import { StoreRow, StoreTableProps } from "../_types/store-table.types";
import { isStoreActive } from "../_utils/store.utils";

export default function StoreTable({
  stores,
  onDeactivate,
  onActivate,
}: StoreTableProps) {
  const columns: DataTableColumn<StoreRow>[] = [
    {
      id: "name",
      header: "Store",
      cell: (store) => (
        <div>
          <p className={!isStoreActive(store) ? "line-through font-medium" : "font-medium"}>
            {store.name}
          </p>
          <p className="text-xs text-muted-foreground">{store.code}</p>
        </div>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: (store) => `${store.city}, ${store.state}`,
    },
    {
      id: "manager",
      header: "Manager",
      cell: (store) => store.managerName,
    },
    {
      id: "users",
      header: "Users",
      cell: (store) => <Badge variant="outline">{store.userCount}</Badge>,
    },
    {
      id: "status",
      header: "Status",
      cell: (store) =>
        isStoreActive(store) ? (
          <Badge variant="outline">Active</Badge>
        ) : (
          <Badge variant="secondary">Deactivated</Badge>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (store) => {
        const active = isStoreActive(store);

        return (
          <div className="flex gap-2">
            <StoreDetailsDialog store={store} />
            <AddStoreDialog
              mode="edit"
              store={store}
              trigger={
                <Button size="icon" variant="ghost">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => (active ? onDeactivate(store.id) : onActivate(store.id))}
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
    <div className="w-full overflow-x-auto">
      <div className="min-w-[860px]">
        <DataTable
          data={stores}
          columns={columns}
          getRowKey={(store) => store.id}
          getRowClassName={(store) => (!isStoreActive(store) ? "opacity-55" : undefined)}
          emptyMessage="No stores found."
        />
      </div>
    </div>
  );
}
