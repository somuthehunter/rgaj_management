"use client";

import { useMemo, useState } from "react";
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

type StoreDetailsDialogProps = {
  store: StoreListItem;
  trigger?: React.ReactNode;
};

export default function StoreDetailsDialog({
  store,
  trigger,
}: StoreDetailsDialogProps) {
  const [open, setOpen] = useState(false);

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
            <span className="text-muted-foreground">Manager</span>
            <span>{store.managerName}</span>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
