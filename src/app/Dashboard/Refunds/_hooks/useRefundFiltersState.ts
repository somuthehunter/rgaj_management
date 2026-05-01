"use client";

import { useEffect, useMemo, useState } from "react";
import { RefundSearchParams } from "@/types/refund";
import { REFUND_SORT_MAP } from "../_constants/refund-controls";

export const useRefundFiltersState = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortValue, setSortValue] = useState<
    "newest" | "oldest" | "amount-desc" | "amount-asc" | "status-asc"
  >("newest");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo<RefundSearchParams>(() => {
    const sortConfig = REFUND_SORT_MAP[sortValue];

    return {
      search: debouncedSearch,
      status: statusFilter === "all" ? "" : (statusFilter as RefundSearchParams["status"]),
      fromDate,
      toDate,
      sortBy: sortConfig.sortBy,
      sortOrder: sortConfig.sortOrder,
      page,
      limit: 10,
    };
  }, [debouncedSearch, fromDate, page, sortValue, statusFilter, toDate]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, fromDate, toDate, sortValue]);

  const resetFilters = () => {
    setPage(1);
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setSortValue("newest");
  };

  return {
    page,
    searchInput,
    statusFilter,
    fromDate,
    toDate,
    sortValue,
    queryParams,
    setPage,
    setSearchInput,
    setStatusFilter,
    setFromDate,
    setToDate,
    setSortValue,
    resetFilters,
  };
};
