"use client";

import { useMemo } from "react";
import { SelectControl } from "@/components/shared/ListControlsBar";
import { StoreListItem } from "@/types/store";
import { InventoryListItem } from "@/types/inventory";
import {
  INVENTORY_SORT_OPTIONS,
} from "../_constants/inventory-controls";
import { InventorySortValue } from "../_types/inventory-controls.types";

type Params = {
  inventory?: InventoryListItem[];
  stores: StoreListItem[];
  isAdmin: boolean;
  selectedStoreId: string;
  selectedCategory: string;
  sortValue: InventorySortValue;
  setStoreFilter: (value: string) => void;
  setCategoryFilter: (value: string) => void;
  setSortValue: (value: InventorySortValue) => void;
};

export const useInventoryFilterControls = ({
  inventory,
  stores,
  isAdmin,
  selectedStoreId,
  selectedCategory,
  sortValue,
  setStoreFilter,
  setCategoryFilter,
  setSortValue,
}: Params) => {
  const storeOptions = useMemo(
    () => [
      { label: "All Stores", value: "all" },
      ...stores.map((store) => ({
        label: store.name,
        value: store.id,
      })),
    ],
    [stores],
  );

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        (inventory ?? [])
          .map((item) => item.category)
          .filter((item): item is string => Boolean(item)),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { label: "All Categories", value: "all" },
      ...categories.map((category) => ({
        label: category,
        value: category,
      })),
    ];
  }, [inventory]);

  const selectControls = useMemo<SelectControl[]>(() => {
    const controls: SelectControl[] = [];

    if (isAdmin) {
      controls.push({
        id: "inventory-store-filter",
        label: "Store",
        value: selectedStoreId,
        options: storeOptions,
        onValueChange: setStoreFilter,
      });
    }

    controls.push(
      {
        id: "inventory-category-filter",
        label: "Category",
        value: selectedCategory,
        options: categoryOptions,
        onValueChange: setCategoryFilter,
      },
      {
        id: "inventory-sort",
        label: "Sort",
        value: sortValue,
        options: INVENTORY_SORT_OPTIONS,
        onValueChange: (value) => setSortValue(value as InventorySortValue),
      },
    );

    return controls;
  }, [
    isAdmin,
    selectedStoreId,
    selectedCategory,
    storeOptions,
    categoryOptions,
    sortValue,
    setStoreFilter,
    setCategoryFilter,
    setSortValue,
  ]);

  return { selectControls };
};
