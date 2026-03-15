"use client";

import { useMemo } from "react";
import { SelectControl } from "@/components/shared/ListControlsBar";
import { ProductListItem } from "@/types/product";
import {
  PRODUCT_SORT_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from "../_constants/product-controls";
import {
  ProductSortValue,
  ProductStatusValue,
} from "../_types/product-controls.types";

type Params = {
  products?: ProductListItem[];
  categoryFilter: string;
  statusFilter: ProductStatusValue;
  sortValue: ProductSortValue;
  setCategoryFilter: (value: string) => void;
  setStatusFilter: (value: ProductStatusValue) => void;
  setSortValue: (value: ProductSortValue) => void;
};

export const useProductFilterControls = ({
  products,
  categoryFilter,
  statusFilter,
  sortValue,
  setCategoryFilter,
  setStatusFilter,
  setSortValue,
}: Params) => {
  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        (products ?? [])
          .map((product) => product?.category)
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
  }, [products]);

  const selectControls = useMemo<SelectControl[]>(
    () => [
      {
        id: "product-category-filter",
        label: "Category",
        value: categoryFilter,
        options: categoryOptions,
        onValueChange: setCategoryFilter,
      },
      {
        id: "product-status-filter",
        label: "Status",
        value: statusFilter,
        options: PRODUCT_STATUS_OPTIONS,
        onValueChange: (value) =>
          setStatusFilter(value as ProductStatusValue),
      },
      {
        id: "product-sort",
        label: "Sort",
        value: sortValue,
        options: PRODUCT_SORT_OPTIONS,
        onValueChange: (value) => setSortValue(value as ProductSortValue),
      },
    ],
    [
      categoryFilter,
      categoryOptions,
      setCategoryFilter,
      statusFilter,
      setStatusFilter,
      sortValue,
      setSortValue,
    ],
  );

  return { selectControls };
};
