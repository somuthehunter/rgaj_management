"use client";

import { useEffect, useMemo, useState } from "react";
import { UserSearchParams } from "@/types/user";
import { USER_SORT_MAP } from "../_constants/user-controls";
import { UserSortValue, UserStatusValue } from "../_types/user-controls.types";
import { UserRole } from "@/types";

export const useUserFiltersState = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatusValue>("all");
  const [sortValue, setSortValue] = useState<UserSortValue>("newest");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo<UserSearchParams>(() => {
    const sortConfig = USER_SORT_MAP[sortValue];

    return {
      search: debouncedSearch,
      storeId: storeFilter === "all" ? "" : storeFilter,
      role: roleFilter === "all" ? "" : roleFilter,
      status: statusFilter === "all" ? "" : statusFilter,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      sortBy: sortConfig?.sortBy,
      sortOrder: sortConfig?.sortOrder ?? "",
      page,
      limit: 10,
    };
  }, [debouncedSearch, page, roleFilter, sortValue, statusFilter, storeFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, storeFilter, roleFilter, statusFilter, sortValue]);

  const resetFilters = () => {
    setPage(1);
    setSearchInput("");
    setDebouncedSearch("");
    setStoreFilter("all");
    setRoleFilter("all");
    setStatusFilter("all");
    setSortValue("newest");
  };

  return {
    searchInput,
    page,
    storeFilter,
    roleFilter,
    statusFilter,
    sortValue,
    queryParams,
    setPage,
    setSearchInput,
    setStoreFilter,
    setRoleFilter,
    setStatusFilter,
    setSortValue,
    resetFilters,
  };
};
