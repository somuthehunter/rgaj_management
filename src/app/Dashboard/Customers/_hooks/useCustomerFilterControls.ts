"use client";

import { useMemo } from "react";
import { SelectControl } from "@/components/shared/ListControlsBar";
import { CustomerListItem } from "@/types/customer";
import { CUSTOMER_SORT_OPTIONS } from "../_constants/customer-controls";
import { CustomerSortValue } from "../_types/customer-controls.types";

type Params = {
  customers?: CustomerListItem[];
  storeFilter: string;
  sortValue: CustomerSortValue;
  setStoreFilter: (value: string) => void;
  setSortValue: (value: CustomerSortValue) => void;
};

export const useCustomerFilterControls = ({
  customers,
  storeFilter,
  sortValue,
  setStoreFilter,
  setSortValue,
}: Params) => {
  const storeOptions = useMemo(() => {
    const stores = Array.from(
      new Set((customers ?? []).flatMap((customer) => customer.storeNames)),
    )
      .sort((a, b) => a.localeCompare(b))
      .map((storeName) => ({ label: storeName, value: storeName }));

    return [{ label: "All Stores", value: "all" }, ...stores];
  }, [customers]);

  const selectControls = useMemo<SelectControl[]>(
    () => [
      {
        id: "customer-store-filter",
        label: "Store",
        value: storeFilter,
        options: storeOptions,
        onValueChange: setStoreFilter,
      },
      {
        id: "customer-sort",
        label: "Sort",
        value: sortValue,
        options: CUSTOMER_SORT_OPTIONS,
        onValueChange: (value) => setSortValue(value as CustomerSortValue),
      },
    ],
    [setSortValue, setStoreFilter, sortValue, storeFilter, storeOptions],
  );

  return { selectControls };
};
