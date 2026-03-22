"use client";

import { useMemo } from "react";
import { SelectControl } from "@/components/shared/ListControlsBar";
import {
  TRANSACTION_EVENT_OPTIONS,
  TRANSACTION_SORT_OPTIONS,
} from "../_constants/transaction-controls";
import {
  TransactionEventValue,
  TransactionSortValue,
} from "../_types/transaction-controls.types";

type Params = {
  eventFilter: TransactionEventValue;
  sortValue: TransactionSortValue;
  setEventFilter: (value: TransactionEventValue) => void;
  setSortValue: (value: TransactionSortValue) => void;
};

export const useTransactionFilterControls = ({
  eventFilter,
  sortValue,
  setEventFilter,
  setSortValue,
}: Params) => {
  const selectControls = useMemo<SelectControl[]>(
    () => [
      {
        id: "transaction-event-filter",
        label: "Event Type",
        value: eventFilter,
        options: TRANSACTION_EVENT_OPTIONS,
        onValueChange: (value) => setEventFilter(value as TransactionEventValue),
      },
      {
        id: "transaction-sort",
        label: "Sort",
        value: sortValue,
        options: TRANSACTION_SORT_OPTIONS,
        onValueChange: (value) => setSortValue(value as TransactionSortValue),
      },
    ],
    [eventFilter, setEventFilter, setSortValue, sortValue],
  );

  return { selectControls };
};
