"use client";

import ListControlsBar from "@/components/shared/ListControlsBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CreateRefundDialog from "./_component/CreateRefundDialog";
import RefundPagination from "./_component/RefundPagination";
import RefundTable from "./_component/RefundTable";
import { useRefundFilterControls } from "./_hooks/useRefundFilterControls";
import { useRefundFiltersState } from "./_hooks/useRefundFiltersState";
import { useRefunds } from "./_hooks/useRefunds";

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

export default function RefundsPage() {
  const filters = useRefundFiltersState();
  const { data, isLoading, isError, error } = useRefunds(filters.queryParams);
  const { selectControls } = useRefundFilterControls({
    statusFilter: filters.statusFilter,
    sortValue: filters.sortValue,
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
          <h1 className="text-2xl font-bold">Refunds</h1>
          <p className="text-sm text-muted-foreground">
            Review refund requests, inspect invoice-linked item details, and approve or reject pending returns.
          </p>
        </div>
        <CreateRefundDialog />
      </div>

      <ListControlsBar
        searchValue={filters.searchInput}
        onSearchValueChange={filters.setSearchInput}
        searchPlaceholder="Search by refund number, RFID, invoice, or store..."
        onReset={filters.resetFilters}
        selectControls={selectControls}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="refund-from-date">From Date</Label>
          <Input
            id="refund-from-date"
            type="date"
            value={filters.fromDate}
            onChange={(event) => filters.setFromDate(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="refund-to-date">To Date</Label>
          <Input
            id="refund-to-date"
            type="date"
            value={filters.toDate}
            onChange={(event) => filters.setToDate(event.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load refunds."}
        </p>
      ) : (
        <div className="space-y-4">
          <RefundTable refunds={data?.data} />
          <RefundPagination
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
