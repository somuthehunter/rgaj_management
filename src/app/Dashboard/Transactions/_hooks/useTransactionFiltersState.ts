"use client";

import { useEffect, useMemo, useState } from "react";
import { TransactionSearchParams } from "@/types/transaction";
import { TRANSACTION_SORT_MAP } from "../_constants/transaction-controls";
import {
  TransactionActionValue,
  TransactionEntityValue,
  TransactionSortValue,
} from "../_types/transaction-controls.types";

export const useTransactionFiltersState = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<TransactionActionValue>("all");
  const [entityFilter, setEntityFilter] = useState<TransactionEntityValue>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortValue, setSortValue] = useState<TransactionSortValue>("newest");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo<TransactionSearchParams>(() => {
    const sortConfig = TRANSACTION_SORT_MAP[sortValue];

    return {
      search: debouncedSearch,
      action: actionFilter === "all" ? "" : actionFilter,
      entity: entityFilter === "all" ? "" : entityFilter,
      fromDate,
      toDate,
      sortBy: sortConfig?.sortBy,
      sortOrder: sortConfig?.sortOrder ?? "",
      page,
      limit: 10,
    };
  }, [actionFilter, debouncedSearch, entityFilter, fromDate, page, sortValue, toDate]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, actionFilter, entityFilter, fromDate, toDate, sortValue]);

  const resetFilters = () => {
    setPage(1);
    setSearchInput("");
    setDebouncedSearch("");
    setActionFilter("all");
    setEntityFilter("all");
    setFromDate("");
    setToDate("");
    setSortValue("newest");
  };

  return {
    searchInput,
    page,
    actionFilter,
    entityFilter,
    fromDate,
    toDate,
    sortValue,
    queryParams,
    setPage,
    setSearchInput,
    setActionFilter,
    setEntityFilter,
    setFromDate,
    setToDate,
    setSortValue,
    resetFilters,
  };
};
