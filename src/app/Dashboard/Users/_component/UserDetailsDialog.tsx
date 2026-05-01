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
import { UserListItem } from "@/types/user";
import { formatTransactionDate } from "@/app/Dashboard/Transactions/_utils/transaction.utils";
import { isUserEntityActive } from "../_utils/user.utils";
import { userService } from "@/services/user.service";

type UserDetailsDialogProps = {
  user: UserListItem;
  trigger?: React.ReactNode;
};

export default function UserDetailsDialog({ user, trigger }: UserDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const detailsQuery = useQuery({
    queryKey: ["user-details", user.id],
    queryFn: () => userService.getById(user.id),
    enabled: open,
  });
  const details = detailsQuery.data?.data ?? user;

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
          <DialogTitle>{details.name}</DialogTitle>
          <DialogDescription>
            User profile, role assignment, and account status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline">
              {isUserEntityActive(details) ? "Active" : "Deactivated"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{details.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Role</span>
            <span>{details.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Store</span>
            <span>{details.storeName || "All Stores"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{details.createdAt ? formatTransactionDate(details.createdAt) : "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Updated</span>
            <span>{details.updatedAt ? formatTransactionDate(details.updatedAt) : "-"}</span>
          </div>
          {detailsQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading user details...</p>
          ) : detailsQuery.isError ? (
            <p className="text-xs text-destructive">Failed to load full user details.</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
