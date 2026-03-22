"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreSearchParams } from "@/types/store";
import { STORE_SORT_MAP } from "../_constants/store-controls";
import { StoreSortValue, StoreStatusValue } from "../_types/store-controls.types";

export const useStoreFiltersState = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StoreStatusValue>("all");
  const [sortValue, setSortValue] = useState<StoreSortValue>("newest");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo<StoreSearchParams>(() => {
    const sortConfig = STORE_SORT_MAP[sortValue];

    return {
      search: debouncedSearch,
      status: statusFilter === "all" ? "" : statusFilter,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
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
