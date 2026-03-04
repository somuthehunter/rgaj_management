import { ReactNode } from "react";
import { ProductListItem } from "@/types/product";

export type ProductDialogMode = "add" | "edit";

export type AddProductDialogProps = {
  mode?: ProductDialogMode;
  product?: ProductListItem;
  trigger?: ReactNode;
};

export type UseProductDialogFormParams = {
  mode: ProductDialogMode;
  product?: ProductListItem;
  open: boolean;
  setOpen: (value: boolean) => void;
};
