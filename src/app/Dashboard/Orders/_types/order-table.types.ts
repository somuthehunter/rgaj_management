import { OrderListItem } from "@/types/order";

export type OrderRow = OrderListItem;

export type OrderTableProps = {
  orders?: OrderRow[];
};
