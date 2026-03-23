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
import { UserListItem } from "@/types/user";
import { formatTransactionDate } from "@/app/Dashboard/Transactions/_utils/transaction.utils";
import { isUserEntityActive } from "../_utils/user.utils";

type UserDetailsDialogProps = {
  user: UserListItem;
  trigger?: React.ReactNode;
};

export default function UserDetailsDialog({ user, trigger }: UserDetailsDialogProps) {
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
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>
            User profile, role assignment, and account status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline">
              {isUserEntityActive(user) ? "Active" : "Deactivated"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span>{user.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Role</span>
            <span>{user.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Store</span>
            <span>{user.storeName || "All Stores"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{user.createdAt ? formatTransactionDate(user.createdAt) : "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Login</span>
            <span>{user.lastLoginAt ? formatTransactionDate(user.lastLoginAt) : "-"}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
