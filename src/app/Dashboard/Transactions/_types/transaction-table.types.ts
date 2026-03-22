import { TransactionLogItem } from "@/types/transaction";

export type TransactionRow = TransactionLogItem;

export type TransactionTableProps = {
  transactions?: TransactionRow[];
};
