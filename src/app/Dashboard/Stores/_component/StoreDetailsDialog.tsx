"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { StoreListItem } from "@/types/store";
import { isStoreActive } from "../_utils/store.utils";
import { storeService } from "@/services/store.service";

type StoreDetailsDialogProps = {
  store: StoreListItem;
  trigger?: React.ReactNode;
};

export default function StoreDetailsDialog({
  store,
  trigger,
}: StoreDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const detailsQuery = useQuery({
    queryKey: ["store-details", store.id],
    queryFn: () => storeService.getById(store.id),
    enabled: open,
  });
  const statsQuery = useQuery({
    queryKey: ["store-stats", store.id],
    queryFn: () => storeService.getStats(store.id),
    enabled: open,
  });

  const fallbackTrigger = useMemo(
    () => (
      <Button size="icon" variant="ghost">
        <Eye className="h-4 w-4" />
      </Button>
    ),
    [],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? fallbackTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{store.name}</DialogTitle>
          <DialogDescription>
            Store profile, contact details, and operational status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline">
              {isStoreActive(store) ? "Active" : "Deactivated"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Code</span>
            <span>{store.code}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span>{store.phone}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-muted-foreground">Address</span>
            <span className="text-right">
              {store.address}, {store.city}, {store.state}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Users</span>
            <span>{store.userCount}</span>
          </div>
          {statsQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading store statistics...</p>
          ) : statsQuery.data?.data ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Active Users</p>
                <p className="text-lg font-semibold">{statsQuery.data.data.stats.activeUsers}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-lg font-semibold">{statsQuery.data.data.stats.totalUsers}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="text-lg font-semibold">{statsQuery.data.data.stats.totalProducts}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Invoices</p>
                <p className="text-lg font-semibold">{statsQuery.data.data.stats.totalInvoices}</p>
              </div>
            </div>
          ) : null}
          {detailsQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading store staff...</p>
          ) : detailsQuery.isError ? (
            <p className="text-xs text-destructive">Failed to load store details.</p>
          ) : detailsQuery.data?.data?.users?.length ? (
            <div className="space-y-2">
              <p className="text-muted-foreground">Assigned Staff</p>
              <div className="space-y-1">
                {detailsQuery.data.data.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span>{user.name}</span>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No users assigned to this store.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
