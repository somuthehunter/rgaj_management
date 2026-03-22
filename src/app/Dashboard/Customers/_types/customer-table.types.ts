import { CustomerListItem } from "@/types/customer";

export type CustomerRow = CustomerListItem;

export type CustomerTableProps = {
  customers?: CustomerRow[];
};
