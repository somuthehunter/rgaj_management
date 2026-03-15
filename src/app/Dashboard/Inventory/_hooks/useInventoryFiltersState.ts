"use client";

import { useEffect, useMemo, useState } from "react";
import { InventorySearchParams } from "@/types/inventory";
import { INVENTORY_SORT_MAP } from "../_constants/inventory-controls";
import { InventorySortValue } from "../_types/inventory-controls.types";

type Params = {
  isAdmin: boolean;
  userStoreId: string;
};

export const useInventoryFiltersState = ({
  isAdmin,
  userStoreId,
}: Params) => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortValue, setSortValue] = useState<InventorySortValue>("newest");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!isAdmin && userStoreId) {
      setStoreFilter(userStoreId);
    }
  }, [isAdmin, userStoreId]);

  const queryParams = useMemo<InventorySearchParams>(() => {
    const sortConfig = INVENTORY_SORT_MAP[sortValue];
    const resolvedStoreId = isAdmin
      ? storeFilter === "all"
        ? ""
        : storeFilter
      : userStoreId;

    return {
      search: debouncedSearch,
      storeId: resolvedStoreId,
      category: categoryFilter === "all" ? "" : categoryFilter,
      sortBy: sortConfig?.sortBy,
      sortOrder: sortConfig?.sortOrder ?? "",
      page,
      limit: 10,
    };
  }, [debouncedSearch, storeFilter, categoryFilter, sortValue, page, isAdmin, userStoreId]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, storeFilter, categoryFilter, sortValue]);

  const resetFilters = () => {
    setPage(1);
    setSearchInput("");
    setDebouncedSearch("");
    setStoreFilter(isAdmin ? "all" : userStoreId);
    setCategoryFilter("all");
    setSortValue("newest");
  };

  return {
    searchInput,
    page,
    storeFilter,
    categoryFilter,
    sortValue,
    queryParams,
    setPage,
    setSearchInput,
    setStoreFilter,
    setCategoryFilter,
    setSortValue,
    resetFilters,
  };
};
