import { StoreListItem } from "@/types/store";

export type StoreRow = StoreListItem;

export type StoreTableProps = {
  stores?: StoreRow[];
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
};
