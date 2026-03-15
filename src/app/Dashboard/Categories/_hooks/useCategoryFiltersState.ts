"use client";

import { useEffect, useMemo, useState } from "react";
import { CategorySearchParams } from "@/types/category";
import { CATEGORY_SORT_MAP } from "../_constants/category-controls";
import {
  CategorySortValue,
  CategoryStatusValue,
} from "../_types/category-controls.types";

export const useCategoryFiltersState = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CategoryStatusValue>("all");
  const [sortValue, setSortValue] = useState<CategorySortValue>("newest");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(t);
  }, [searchInput]);

  const queryParams = useMemo<CategorySearchParams>(() => {
    const sortConfig = CATEGORY_SORT_MAP[sortValue];

    return {
      search: debouncedSearch,
      status: statusFilter === "all" ? "" : statusFilter,
      isActive:
        statusFilter === "all"
          ? undefined
          : statusFilter === "active",
      sortBy: sortConfig?.sortBy,
      sortOrder: sortConfig?.sortOrder ?? "",
      page,
      limit: 10,
    };
  }, [debouncedSearch, statusFilter, sortValue, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sortValue]);

  const resetFilters = () => {
    setPage(1);
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setSortValue("newest");
  };

  return {
    searchInput,
    page,
    statusFilter,
    sortValue,
    queryParams,
    setPage,
    setSearchInput,
    setStatusFilter,
    setSortValue,
    resetFilters,
  };
};
