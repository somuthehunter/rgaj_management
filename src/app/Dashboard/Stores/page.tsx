"use client";

import AddStoreDialog from "./_component/AddStoreDialog";
import StorePagination from "./_component/StorePagination";
import StoreTable from "./_component/StoreTable";
import { useStores } from "./_hooks/useStores";
import ListControlsBar from "@/components/shared/ListControlsBar";
import { useStoreActions } from "./_hooks/useStoreActions";
import { useStoreFiltersState } from "./_hooks/useStoreFiltersState";
import { useStoreFilterControls } from "./_hooks/useStoreFilterControls";

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

export default function StoresPage() {
  const filters = useStoreFiltersState();
  const { data, isLoading } = useStores(filters.queryParams);
  const { selectControls } = useStoreFilterControls({
    statusFilter: filters.statusFilter,
    sortValue: filters.sortValue,
    setStatusFilter: filters.setStatusFilter,
    setSortValue: filters.setSortValue,
  });
  const { handleActivate, handleDeactivate } = useStoreActions();

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
          <h1 className="text-2xl font-bold">Stores</h1>
          <p className="text-sm text-muted-foreground">
            Manage all store branches, manager assignments, and branch status.
          </p>
        </div>
        <AddStoreDialog />
      </div>

      <ListControlsBar
        searchValue={filters.searchInput}
        onSearchValueChange={filters.setSearchInput}
        searchPlaceholder="Search stores by name, code, or city..."
        onReset={filters.resetFilters}
        selectControls={selectControls}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <StoreTable
            stores={data?.data}
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
          />
          <StorePagination
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
