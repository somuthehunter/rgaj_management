"use client";

import { useMemo } from "react";
import { SelectControl } from "@/components/shared/ListControlsBar";
import { REFUND_SORT_OPTIONS, REFUND_STATUS_OPTIONS } from "../_constants/refund-controls";

export const useRefundFilterControls = ({
  statusFilter,
  sortValue,
  setStatusFilter,
  setSortValue,
}: {
  statusFilter: string;
  sortValue: string;
  setStatusFilter: (value: string) => void;
  setSortValue: (value: "newest" | "oldest" | "amount-desc" | "amount-asc" | "status-asc") => void;
}) => {
  const selectControls = useMemo<SelectControl[]>(
    () => [
      {
        id: "refund-status-filter",
        label: "Status",
        value: statusFilter,
        options: REFUND_STATUS_OPTIONS,
        onValueChange: setStatusFilter,
      },
      {
        id: "refund-sort",
        label: "Sort",
        value: sortValue,
        options: REFUND_SORT_OPTIONS,
        onValueChange: (value) =>
          setSortValue(value as "newest" | "oldest" | "amount-desc" | "amount-asc" | "status-asc"),
      },
    ],
    [setSortValue, setStatusFilter, sortValue, statusFilter],
  );

  return { selectControls };
};
