"use client";

import { useEffect, useMemo, useState } from "react";
import { TransactionSearchParams } from "@/types/transaction";
import { TRANSACTION_SORT_MAP } from "../_constants/transaction-controls";
import {
  TransactionEventValue,
  TransactionSortValue,
} from "../_types/transaction-controls.types";

export const useTransactionFiltersState = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<TransactionEventValue>("all");
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
      eventType: eventFilter === "all" ? "" : eventFilter,
      sortBy: sortConfig?.sortBy,
      sortOrder: sortConfig?.sortOrder ?? "",
      page,
      limit: 10,
    };
  }, [debouncedSearch, eventFilter, sortValue, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, eventFilter, sortValue]);

  const resetFilters = () => {
    setPage(1);
    setSearchInput("");
    setDebouncedSearch("");
    setEventFilter("all");
    setSortValue("newest");
  };

  return {
    searchInput,
    page,
    eventFilter,
    sortValue,
    queryParams,
    setPage,
    setSearchInput,
    setEventFilter,
    setSortValue,
    resetFilters,
  };
};
