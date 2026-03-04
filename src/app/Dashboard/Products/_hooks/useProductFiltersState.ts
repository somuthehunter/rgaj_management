"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductSearchParams } from "@/types/product";
import {
  PRODUCT_SORT_MAP,
} from "../_constants/product-controls";
import {
  ProductSortValue,
  ProductStatusValue,
} from "../_types/product-controls.types";

export const useProductFiltersState = () => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ProductStatusValue>("all");
  const [sortValue, setSortValue] = useState<ProductSortValue>("newest");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(t);
  }, [searchInput]);

  const queryParams = useMemo<ProductSearchParams>(() => {
    const sortConfig = PRODUCT_SORT_MAP[sortValue];

    return {
      search: debouncedSearch,
      category: categoryFilter === "all" ? "" : categoryFilter,
      status: statusFilter === "all" ? "" : statusFilter,
      sortBy: sortConfig?.sortBy,
      sortOrder: sortConfig?.sortOrder ?? "",
    };
  }, [debouncedSearch, categoryFilter, statusFilter, sortValue]);

  const resetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setSortValue("newest");
  };

  return {
    searchInput,
    categoryFilter,
    statusFilter,
    sortValue,
    queryParams,
    setSearchInput,
    setCategoryFilter,
    setStatusFilter,
    setSortValue,
    resetFilters,
  };
};
