"use client";

import { useMemo } from "react";
import { SelectControl } from "@/components/shared/ListControlsBar";
import { OrderListItem } from "@/types/order";
import {
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_OPTIONS,
} from "../_constants/order-controls";
import {
  OrderSortValue,
  OrderStatusValue,
} from "../_types/order-controls.types";

type Params = {
  orders?: OrderListItem[];
  storeFilter: string;
  statusFilter: OrderStatusValue;
  sortValue: OrderSortValue;
  setStoreFilter: (value: string) => void;
  setStatusFilter: (value: OrderStatusValue) => void;
  setSortValue: (value: OrderSortValue) => void;
};

export const useOrderFilterControls = ({
  orders,
  storeFilter,
  statusFilter,
  sortValue,
  setStoreFilter,
  setStatusFilter,
  setSortValue,
}: Params) => {
  const storeOptions = useMemo(() => {
    const stores = Array.from(
      new Map(
        (orders ?? []).map((order) => [
          order.storeId,
          { label: order.storeName, value: order.storeId },
        ]),
      ).values(),
    ).sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: "All Stores", value: "all" }, ...stores];
  }, [orders]);

  const selectControls = useMemo<SelectControl[]>(
    () => [
      {
        id: "order-store-filter",
        label: "Store",
        value: storeFilter,
        options: storeOptions,
        onValueChange: setStoreFilter,
      },
      {
        id: "order-status-filter",
        label: "Status",
        value: statusFilter,
        options: ORDER_STATUS_OPTIONS,
        onValueChange: (value) => setStatusFilter(value as OrderStatusValue),
      },
      {
        id: "order-sort",
        label: "Sort",
        value: sortValue,
        options: ORDER_SORT_OPTIONS,
        onValueChange: (value) => setSortValue(value as OrderSortValue),
      },
    ],
    [
      setSortValue,
      setStatusFilter,
      setStoreFilter,
      sortValue,
      statusFilter,
      storeFilter,
      storeOptions,
    ],
  );

  return { selectControls };
};
