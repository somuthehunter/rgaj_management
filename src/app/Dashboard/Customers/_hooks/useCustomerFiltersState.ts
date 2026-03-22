"use client";

import { useEffect, useMemo, useState } from "react";
import { CustomerSearchParams } from "@/types/customer";
import { CUSTOMER_SORT_MAP } from "../_constants/customer-controls";
import { CustomerSortValue } from "../_types/customer-controls.types";

export const useCustomerFiltersState = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [sortValue, setSortValue] = useState<CustomerSortValue>("latest");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo<CustomerSearchParams>(() => {
    const sortConfig = CUSTOMER_SORT_MAP[sortValue];

    return {
      search: debouncedSearch,
      storeName: storeFilter === "all" ? "" : storeFilter,
      sortBy: sortConfig?.sortBy,
      sortOrder: sortConfig?.sortOrder ?? "",
      page,
      limit: 10,
    };
  }, [debouncedSearch, storeFilter, sortValue, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, storeFilter, sortValue]);

  const resetFilters = () => {
    setPage(1);
    setSearchInput("");
    setDebouncedSearch("");
    setStoreFilter("all");
    setSortValue("latest");
  };

  return {
    searchInput,
    page,
    storeFilter,
    sortValue,
    queryParams,
    setPage,
    setSearchInput,
    setStoreFilter,
    setSortValue,
    resetFilters,
  };
};
