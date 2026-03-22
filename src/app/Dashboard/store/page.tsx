"use client";

import { useEffect, useState } from "react";
import AddStoreDialog from "./_component/AddStoreDialog";
import StorePagination from "./_component/StorePagination";
import StoreTable from "./_component/StoreTable";
import { useStores } from "./_hooks/useStores";
import { getUser } from "@/services/session.service";
import { UserRole } from "@/types";
import ListControlsBar from "@/components/shared/ListControlsBar";
import { useStoreActions } from "./_hooks/useStoreActions";
import { useStoreFiltersState } from "./_hooks/useStoreFiltersState";
import { useStoreFilterControls } from "./_hooks/useStoreFilterControls";

const buildPageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
};

export default function StoresPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = getUser();
    const normalizedRole = user?.role?.toUpperCase();

    setIsAdmin(
      normalizedRole === UserRole.SUPER_ADMIN || normalizedRole === "ADMIN",
    );
  }, []);

  // ✅ Filters
  const filters = useStoreFiltersState();

  // ✅ API call
  const { data, isLoading } = useStores(filters.queryParams);

  // ✅ Select controls (dropdown filters)
  const { selectControls } = useStoreFilterControls({
    stores: data?.data,
    statusFilter: filters.statusFilter,
    sortValue: filters.sortValue,
    setStatusFilter: filters.setStatusFilter,
    setSortValue: filters.setSortValue,
  });

  // ✅ Actions
  const { handleDeactivate, handleActivate } = useStoreActions();

  // ✅ Pagination logic
  const currentPage = data?.page ?? filters.page;
  const totalItems = data?.total ?? 0;
  const itemsPerPage = data?.limit ?? filters.queryParams.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Stores</h1>

        <div className="flex items-center gap-2">
          <AddStoreDialog />
        </div>
      </div>

      {/* Filters + Search */}
      <ListControlsBar
        searchValue={filters.searchInput}
        onSearchValueChange={filters.setSearchInput}
        searchPlaceholder="Search stores by name..."
        onReset={filters.resetFilters}
        selectControls={selectControls}
      />

      {/* Table */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <StoreTable
            stores={data?.data}
            isAdmin={isAdmin}
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
          />

          <StorePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            from={from}
            to={to}
            pageNumbers={pageNumbers}
            canGoPrevious={currentPage > 1}
            canGoNext={currentPage < totalPages}
            onPageChange={filters.setPage}
            onPrevious={() => filters.setPage(Math.max(1, currentPage - 1))}
            onNext={() =>
              filters.setPage(Math.min(totalPages, currentPage + 1))
            }
          />
        </div>
      )}
    </div>
  );
}
