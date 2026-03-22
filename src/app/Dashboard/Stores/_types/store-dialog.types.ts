import { StoreListItem } from "@/types/store";

export type AddStoreDialogProps = {
  mode?: "add" | "edit";
  store?: StoreListItem;
  trigger?: React.ReactNode;
};

export type UseStoreDialogFormParams = {
  mode: "add" | "edit";
  store?: StoreListItem;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
