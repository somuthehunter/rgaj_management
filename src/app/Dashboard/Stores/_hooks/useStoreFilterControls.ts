"use client";

import { useMemo } from "react";
import { SelectControl } from "@/components/shared/ListControlsBar";
import { STORE_SORT_OPTIONS, STORE_STATUS_OPTIONS } from "../_constants/store-controls";
import { StoreSortValue, StoreStatusValue } from "../_types/store-controls.types";

type Params = {
  statusFilter: StoreStatusValue;
  sortValue: StoreSortValue;
  setStatusFilter: (value: StoreStatusValue) => void;
  setSortValue: (value: StoreSortValue) => void;
};

export const useStoreFilterControls = ({
  statusFilter,
  sortValue,
  setStatusFilter,
  setSortValue,
}: Params) => {
  const selectControls = useMemo<SelectControl[]>(
    () => [
      {
        id: "store-status-filter",
        label: "Status",
        value: statusFilter,
        options: STORE_STATUS_OPTIONS,
        onValueChange: (value) => setStatusFilter(value as StoreStatusValue),
      },
      {
        id: "store-sort",
        label: "Sort",
        value: sortValue,
        options: STORE_SORT_OPTIONS,
        onValueChange: (value) => setSortValue(value as StoreSortValue),
      },
    ],
    [setSortValue, setStatusFilter, sortValue, statusFilter],
  );

  return { selectControls };
};
