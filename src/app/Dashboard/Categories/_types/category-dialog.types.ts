import { ReactNode } from "react";
import { CategoryListItem } from "@/types/category";

export type CategoryDialogMode = "add" | "edit";

export type AddCategoryDialogProps = {
  mode?: CategoryDialogMode;
  category?: CategoryListItem;
  trigger?: ReactNode;
};

export type UseCategoryDialogFormParams = {
  mode: CategoryDialogMode;
  category?: CategoryListItem;
  open: boolean;
  setOpen: (value: boolean) => void;
};
