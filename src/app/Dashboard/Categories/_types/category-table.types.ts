import { CategoryListItem } from "@/types/category";

export type CategoryTableProps = {
  categories?: CategoryRow[];
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
};

export type CategoryRow = CategoryListItem;
