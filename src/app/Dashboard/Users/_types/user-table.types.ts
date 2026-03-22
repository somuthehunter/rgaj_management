import { UserListItem } from "@/types/user";

export type UserRow = UserListItem;

export type UserTableProps = {
  users?: UserRow[];
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
};
