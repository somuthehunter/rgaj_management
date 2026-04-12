import { CategoryListItem } from "@/types/category";

export type CategoryTableProps = {
  categories?: CategoryRow[];
  canManage: boolean;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
};

export type CategoryRow = CategoryListItem;
