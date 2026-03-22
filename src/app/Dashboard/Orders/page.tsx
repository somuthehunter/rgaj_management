"use client";

import ListControlsBar from "@/components/shared/ListControlsBar";
import OrderPagination from "./_component/OrderPagination";
import OrderTable from "./_component/OrderTable";
import { useOrderFilterControls } from "./_hooks/useOrderFilterControls";
import { useOrderFiltersState } from "./_hooks/useOrderFiltersState";
import { useOrders } from "./_hooks/useOrders";

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

export default function OrdersPage() {
  const filters = useOrderFiltersState();
  const { data, isLoading } = useOrders(filters.queryParams);
  const { selectControls } = useOrderFilterControls({
    orders: data?.data,
    storeFilter: filters.storeFilter,
    statusFilter: filters.statusFilter,
    sortValue: filters.sortValue,
    setStoreFilter: filters.setStoreFilter,
    setStatusFilter: filters.setStatusFilter,
    setSortValue: filters.setSortValue,
  });

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
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Review customer orders, inspect bill details, and download order bills.
          </p>
        </div>
      </div>

      <ListControlsBar
        searchValue={filters.searchInput}
        onSearchValueChange={filters.setSearchInput}
        searchPlaceholder="Search by order ID, store, customer, or phone..."
        onReset={filters.resetFilters}
        selectControls={selectControls}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <OrderTable orders={data?.data} />
          <OrderPagination
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
