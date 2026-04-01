"use client";

import { useMemo } from "react";
import { SelectControl } from "@/components/shared/ListControlsBar";
import {
  TRANSACTION_ACTION_OPTIONS,
  TRANSACTION_ENTITY_OPTIONS,
  TRANSACTION_SORT_OPTIONS,
} from "../_constants/transaction-controls";
import {
  TransactionActionValue,
  TransactionEntityValue,
  TransactionSortValue,
} from "../_types/transaction-controls.types";

type Params = {
  actionFilter: TransactionActionValue;
  entityFilter: TransactionEntityValue;
  sortValue: TransactionSortValue;
  setActionFilter: (value: TransactionActionValue) => void;
  setEntityFilter: (value: TransactionEntityValue) => void;
  setSortValue: (value: TransactionSortValue) => void;
};

export const useTransactionFilterControls = ({
  actionFilter,
  entityFilter,
  sortValue,
  setActionFilter,
  setEntityFilter,
  setSortValue,
}: Params) => {
  const selectControls = useMemo<SelectControl[]>(
    () => [
      {
        id: "transaction-action-filter",
        label: "Action",
        value: actionFilter,
        options: TRANSACTION_ACTION_OPTIONS,
        onValueChange: (value) => setActionFilter(value as TransactionActionValue),
      },
      {
        id: "transaction-entity-filter",
        label: "Entity",
        value: entityFilter,
        options: TRANSACTION_ENTITY_OPTIONS,
        onValueChange: (value) => setEntityFilter(value as TransactionEntityValue),
      },
      {
        id: "transaction-sort",
        label: "Sort",
        value: sortValue,
        options: TRANSACTION_SORT_OPTIONS,
        onValueChange: (value) => setSortValue(value as TransactionSortValue),
      },
    ],
    [actionFilter, entityFilter, setActionFilter, setEntityFilter, setSortValue, sortValue],
  );

  return { selectControls };
};
