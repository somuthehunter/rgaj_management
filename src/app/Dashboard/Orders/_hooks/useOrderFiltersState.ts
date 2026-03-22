"use client";

import { useEffect, useMemo, useState } from "react";
import { OrderSearchParams } from "@/types/order";
import { ORDER_SORT_MAP } from "../_constants/order-controls";
import {
  OrderSortValue,
  OrderStatusValue,
} from "../_types/order-controls.types";

export const useOrderFiltersState = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatusValue>("all");
  const [sortValue, setSortValue] = useState<OrderSortValue>("newest");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo<OrderSearchParams>(() => {
    const sortConfig = ORDER_SORT_MAP[sortValue];

    return {
      search: debouncedSearch,
      storeId: storeFilter === "all" ? "" : storeFilter,
      status: statusFilter === "all" ? "" : statusFilter,
      sortBy: sortConfig?.sortBy,
      sortOrder: sortConfig?.sortOrder ?? "",
      page,
      limit: 10,
    };
  }, [debouncedSearch, storeFilter, statusFilter, sortValue, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, storeFilter, statusFilter, sortValue]);

  const resetFilters = () => {
    setPage(1);
    setSearchInput("");
    setDebouncedSearch("");
    setStoreFilter("all");
    setStatusFilter("all");
    setSortValue("newest");
  };

  return {
    searchInput,
    page,
    storeFilter,
    statusFilter,
    sortValue,
    queryParams,
    setPage,
    setSearchInput,
    setStoreFilter,
    setStatusFilter,
    setSortValue,
    resetFilters,
  };
};
