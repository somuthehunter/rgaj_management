"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { DataTableColumn } from "@/components/shared/DataTable";
import { Ban, CheckCircle2, Pencil } from "lucide-react";
import AddUserDialog from "./AddUserDialog";
import UserDetailsDialog from "./UserDetailsDialog";
import { UserRow, UserTableProps } from "../_types/user-table.types";
import { isUserEntityActive } from "../_utils/user.utils";

export default function UserTable({
  users,
  onDeactivate,
  onActivate,
}: UserTableProps) {
  const columns: DataTableColumn<UserRow>[] = [
    {
      id: "name",
      header: "Name",
      cell: (user) => (
        <div>
          <p className={!isUserEntityActive(user) ? "line-through font-medium" : "font-medium"}>
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: (user) => user.email,
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => <Badge variant="outline">{user.role}</Badge>,
    },
    {
      id: "store",
      header: "Store",
      cell: (user) => user.storeName || "All Stores",
    },
    {
      id: "status",
      header: "Status",
      cell: (user) =>
        isUserEntityActive(user) ? (
          <Badge variant="outline">Active</Badge>
        ) : (
          <Badge variant="secondary">Deactivated</Badge>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (user) => {
        const active = isUserEntityActive(user);

        return (
          <div className="flex gap-2">
            <UserDetailsDialog user={user} />
            <AddUserDialog
              mode="edit"
              user={user}
              trigger={
                <Button size="icon" variant="ghost">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => (active ? onDeactivate(user.id) : onActivate(user.id))}
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
      <div className="min-w-[900px]">
        <DataTable
          data={users}
          columns={columns}
          getRowKey={(user) => user.id}
          getRowClassName={(user) => (!isUserEntityActive(user) ? "opacity-55" : undefined)}
          emptyMessage="No users found."
        />
      </div>
    </div>
  );
}
