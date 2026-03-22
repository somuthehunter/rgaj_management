"use client";

import { Button } from "@/components/ui/button";
import ListControlsBar from "@/components/shared/ListControlsBar";
import { Download } from "lucide-react";
import CustomerPagination from "./_component/CustomerPagination";
import CustomerTable from "./_component/CustomerTable";
import { useCustomerFilterControls } from "./_hooks/useCustomerFilterControls";
import { useCustomerFiltersState } from "./_hooks/useCustomerFiltersState";
import { useCustomers } from "./_hooks/useCustomers";
import { customerService } from "@/services/customer.service";
import { downloadCustomersCsv } from "./_utils/customer.utils";

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

export default function CustomersPage() {
  const filters = useCustomerFiltersState();
  const { data, isLoading } = useCustomers(filters.queryParams);
  const { selectControls } = useCustomerFilterControls({
    customers: data?.data,
    storeFilter: filters.storeFilter,
    sortValue: filters.sortValue,
    setStoreFilter: filters.setStoreFilter,
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
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Track customer purchase history, review all linked orders, and export customer data.
          </p>
        </div>
      </div>

      <ListControlsBar
        searchValue={filters.searchInput}
        onSearchValueChange={filters.setSearchInput}
        searchPlaceholder="Search by customer name, phone, email, or order ID..."
        onReset={filters.resetFilters}
        selectControls={selectControls}
        extraActions={
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadCustomersCsv(customerService.getExportRows())}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <CustomerTable customers={data?.data} />
          <CustomerPagination
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
