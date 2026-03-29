"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SelectControl } from "@/components/shared/ListControlsBar";
import { storeService } from "@/services/store.service";
import { USER_ROLE_OPTIONS, USER_SORT_OPTIONS, USER_STATUS_OPTIONS } from "../_constants/user-controls";
import { UserSortValue, UserStatusValue } from "../_types/user-controls.types";
import { UserRole } from "@/types";

type Params = {
  storeFilter: string;
  roleFilter: UserRole | "all";
  statusFilter: UserStatusValue;
  sortValue: UserSortValue;
  setStoreFilter: (value: string) => void;
  setRoleFilter: (value: UserRole | "all") => void;
  setStatusFilter: (value: UserStatusValue) => void;
  setSortValue: (value: UserSortValue) => void;
};

export const useUserFilterControls = ({
  storeFilter,
  roleFilter,
  statusFilter,
  sortValue,
  setStoreFilter,
  setRoleFilter,
  setStatusFilter,
  setSortValue,
}: Params) => {
  const storesQuery = useQuery({
    queryKey: ["user-filter-store-options"],
    queryFn: () => storeService.search({ page: 1, limit: 100 }),
  });

  const storeOptions = useMemo(
    () => [
      { label: "All Stores", value: "all" },
      ...(storesQuery.data?.data ?? storeService.getOptions()).map((store) => ({
        label: store.name,
        value: store.id,
      })),
    ],
    [storesQuery.data],
  );

  const selectControls = useMemo<SelectControl[]>(
    () => [
      {
        id: "user-store-filter",
        label: "Store",
        value: storeFilter,
        options: storeOptions,
        onValueChange: setStoreFilter,
      },
      {
        id: "user-role-filter",
        label: "Role",
        value: roleFilter,
        options: USER_ROLE_OPTIONS,
        onValueChange: (value) => setRoleFilter(value as UserRole | "all"),
      },
      {
        id: "user-status-filter",
        label: "Status",
        value: statusFilter,
        options: USER_STATUS_OPTIONS,
        onValueChange: (value) => setStatusFilter(value as UserStatusValue),
      },
      {
        id: "user-sort",
        label: "Sort",
        value: sortValue,
        options: USER_SORT_OPTIONS,
        onValueChange: (value) => setSortValue(value as UserSortValue),
      },
    ],
    [
      roleFilter,
      setRoleFilter,
      setSortValue,
      setStatusFilter,
      setStoreFilter,
      sortValue,
      statusFilter,
      storeFilter,
      storeOptions,
    ],
  );

  return { selectControls };
};
