"use client";

import { useMemo } from "react";
import { SelectControl } from "@/components/shared/ListControlsBar";
import {
  CATEGORY_SORT_OPTIONS,
  CATEGORY_STATUS_OPTIONS,
} from "../_constants/category-controls";
import {
  CategorySortValue,
  CategoryStatusValue,
} from "../_types/category-controls.types";

type Params = {
  statusFilter: CategoryStatusValue;
  sortValue: CategorySortValue;
  setStatusFilter: (value: CategoryStatusValue) => void;
  setSortValue: (value: CategorySortValue) => void;
};

export const useCategoryFilterControls = ({
  statusFilter,
  sortValue,
  setStatusFilter,
  setSortValue,
}: Params) => {
  const selectControls = useMemo<SelectControl[]>(
    () => [
      {
        id: "category-status-filter",
        label: "Status",
        value: statusFilter,
        options: CATEGORY_STATUS_OPTIONS,
        onValueChange: (value) =>
          setStatusFilter(value as CategoryStatusValue),
      },
      {
        id: "category-sort",
        label: "Sort",
        value: sortValue,
        options: CATEGORY_SORT_OPTIONS,
        onValueChange: (value) => setSortValue(value as CategorySortValue),
      },
    ],
    [setSortValue, setStatusFilter, sortValue, statusFilter],
  );

  return { selectControls };
};
