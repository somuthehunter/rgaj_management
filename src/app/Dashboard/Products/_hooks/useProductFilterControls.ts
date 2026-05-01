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
  weightUnitFilter: "" | "RATI" | "CARAT";
  statusFilter: ProductStatusValue;
  sortValue: ProductSortValue;
  setCategoryFilter: (value: string) => void;
  setWeightUnitFilter: (value: "" | "RATI" | "CARAT") => void;
  setStatusFilter: (value: ProductStatusValue) => void;
  setSortValue: (value: ProductSortValue) => void;
};

export const useProductFilterControls = ({
  products,
  categoryFilter,
  weightUnitFilter,
  statusFilter,
  sortValue,
  setCategoryFilter,
  setWeightUnitFilter,
  setStatusFilter,
  setSortValue,
}: Params) => {
  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Map(
        (products ?? [])
          .filter((product) => product.categoryId)
          .map((product) => [
            product.categoryId,
            product.categoryName,
          ]),
      ),
    ).sort((a, b) => a[1].localeCompare(b[1]));

    return [
      { label: "All Categories", value: "all" },
      ...categories.map(([id, name]) => ({
        label: name,
        value: id,
      })),
    ];
  }, [products]);

  const weightUnitOptions = useMemo(
    () => [
      { label: "All Units", value: "all" },
      { label: "RATI", value: "RATI" },
      { label: "CARAT", value: "CARAT" },
    ],
    [],
  );

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
        id: "product-weight-unit-filter",
        label: "Unit",
        value: weightUnitFilter || "all",
        options: weightUnitOptions,
        onValueChange: (value) =>
          setWeightUnitFilter(value === "all" ? "" : (value as "RATI" | "CARAT")),
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
      setWeightUnitFilter,
      statusFilter,
      setStatusFilter,
      sortValue,
      setSortValue,
      weightUnitOptions,
      weightUnitFilter,
    ],
  );

  return { selectControls };
};
