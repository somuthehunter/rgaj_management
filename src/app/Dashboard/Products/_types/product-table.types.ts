import { ProductListItem } from "@/types/product";

export type ProductTableProps = {
  products?: ProductRow[];
  canManageStatus: boolean;
  canEdit: boolean;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
};

export type ProductRow = ProductListItem;
