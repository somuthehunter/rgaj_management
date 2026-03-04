import { ProductListItem } from "@/types/product";

export type ProductTableProps = {
  products?: ProductRow[];
  isAdmin: boolean;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
  onReturn: (id: string) => void;
};

export type ProductRow = ProductListItem;
