"use client";

import AddUserDialog from "./_component/AddUserDialog";
import UserPagination from "./_component/UserPagination";
import UserTable from "./_component/UserTable";
import ListControlsBar from "@/components/shared/ListControlsBar";
import { useUsers } from "./_hooks/useUsers";
import { useUserActions } from "./_hooks/useUserActions";
import { useUserFiltersState } from "./_hooks/useUserFiltersState";
import { useUserFilterControls } from "./_hooks/useUserFilterControls";

const buildPageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) return [1, 2, 3, 4, totalPages];
  if (currentPage >= totalPages - 2) {
    return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
};

export default function UsersPage() {
  const filters = useUserFiltersState();
  const { data, isLoading, isError, error } = useUsers(filters.queryParams);
  const { selectControls } = useUserFilterControls({
    storeFilter: filters.storeFilter,
    roleFilter: filters.roleFilter,
    statusFilter: filters.statusFilter,
    sortValue: filters.sortValue,
    setStoreFilter: filters.setStoreFilter,
    setRoleFilter: filters.setRoleFilter,
    setStatusFilter: filters.setStatusFilter,
    setSortValue: filters.setSortValue,
  });
  const { handleActivate, handleDeactivate } = useUserActions();

  const currentPage = data?.page ?? filters.page;
  const totalItems = data?.total ?? 0;
  const itemsPerPage = data?.limit ?? filters.queryParams.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage super admins, store admins, cashiers, role assignments, and account status.
          </p>
        </div>
        <AddUserDialog />
      </div>

      <ListControlsBar
        searchValue={filters.searchInput}
        onSearchValueChange={filters.setSearchInput}
        searchPlaceholder="Search users by name, email, or store..."
        onReset={filters.resetFilters}
        selectControls={selectControls}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load users."}
        </p>
      ) : (
        <div className="space-y-4">
          <UserTable
            users={data?.data}
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
          />
          <UserPagination
            currentPage={currentPage}
            totalItems={totalItems}
            from={from}
            to={to}
            pageNumbers={pageNumbers}
            canGoPrevious={currentPage > 1}
            canGoNext={currentPage < totalPages}
            onPageChange={filters.setPage}
            onPrevious={() => filters.setPage(Math.max(1, currentPage - 1))}
            onNext={() => filters.setPage(Math.min(totalPages, currentPage + 1))}
          />
        </div>
      )}
    </div>
  );
}
