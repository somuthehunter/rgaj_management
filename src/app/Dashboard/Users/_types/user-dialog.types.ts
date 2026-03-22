import { UserListItem } from "@/types/user";

export type AddUserDialogProps = {
  mode?: "add" | "edit";
  user?: UserListItem;
  trigger?: React.ReactNode;
};

export type UseUserDialogFormParams = {
  mode: "add" | "edit";
  user?: UserListItem;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
