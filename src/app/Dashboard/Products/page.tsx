"use client";

import AddProductDialog from "./_component/AddProductDialog";
import ProductPagination from "./_component/ProductPagination";
import ProductTable from "./_component/ProductTable";
import { useProducts } from "./_hooks/useProducts";
import { getUser } from "@/services/session.service";
import { UserRole } from "@/types";
import ListControlsBar from "@/components/shared/ListControlsBar";
import { useProductActions } from "./_hooks/useProductActions";
import { useProductFiltersState } from "./_hooks/useProductFiltersState";
import { useProductFilterControls } from "./_hooks/useProductFilterControls";

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

export default function ProductsPage() {
  const user = getUser();
  const normalizedRole = user?.role?.toUpperCase();
  const isAdmin =
    normalizedRole === UserRole.SUPER_ADMIN || normalizedRole === "ADMIN";

  const filters = useProductFiltersState();
  const { data, isLoading } = useProducts(filters.queryParams);
  const { selectControls } = useProductFilterControls({
    products: data?.data,
    categoryFilter: filters.categoryFilter,
    statusFilter: filters.statusFilter,
    sortValue: filters.sortValue,
    setCategoryFilter: filters.setCategoryFilter,
    setStatusFilter: filters.setStatusFilter,
    setSortValue: filters.setSortValue,
  });

  const { handleDeactivate, handleActivate, handleReturn } = useProductActions();

  const currentPage = data?.page ?? filters.page;
  const totalItems = data?.total ?? 0;
  const itemsPerPage = data?.limit ?? filters.queryParams.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <AddProductDialog />
      </div>

      <ListControlsBar
        searchValue={filters.searchInput}
        onSearchValueChange={filters.setSearchInput}
        searchPlaceholder="Search products by name or SKU..."
        onReset={filters.resetFilters}
        selectControls={selectControls}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <ProductTable
            products={data?.data}
            isAdmin={isAdmin}
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
            onReturn={handleReturn}
          />
          <ProductPagination
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
            onNext={() => filters.setPage(Math.min(totalPages, currentPage + 1))}
          />
        </div>
      )}
    </div>
  );
}
