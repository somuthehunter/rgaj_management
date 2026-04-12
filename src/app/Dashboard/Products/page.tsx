"use client";

import { useEffect, useState } from "react";
import AddProductDialog from "./_component/AddProductDialog";
import ProductPagination from "./_component/ProductPagination";
import ProductTable from "./_component/ProductTable";
import { useProducts } from "./_hooks/useProducts";
import { getUser } from "@/services/session.service";
import { UserRole } from "@/types";
import { normalizeRole } from "@/lib/auth";
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
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const user = getUser();
    const normalizedRole = normalizeRole(user?.role);
    setRole(normalizedRole ?? null);
  }, []);

  const filters = useProductFiltersState();
  const { data, isLoading, isError, error } = useProducts(filters.queryParams);
  const { selectControls } = useProductFilterControls({
    products: data?.data,
    categoryFilter: filters.categoryFilter,
    weightUnitFilter: filters.weightUnitFilter,
    statusFilter: filters.statusFilter,
    sortValue: filters.sortValue,
    setCategoryFilter: filters.setCategoryFilter,
    setWeightUnitFilter: filters.setWeightUnitFilter,
    setStatusFilter: filters.setStatusFilter,
    setSortValue: filters.setSortValue,
  });

  const { handleDeactivate, handleActivate } = useProductActions();

  const currentPage = data?.page ?? filters.page;
  const totalItems = data?.total ?? 0;
  const itemsPerPage = data?.limit ?? filters.queryParams.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  const canEdit = role === UserRole.SUPER_ADMIN || role === UserRole.STORE_ADMIN;
  const canManageStatus = role === UserRole.SUPER_ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          {canEdit ? <AddProductDialog /> : null}
        </div>
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
      ) : isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load products."}
        </p>
      ) : (
        <div className="space-y-4">
          <ProductTable
            products={data?.data}
            canManageStatus={canManageStatus}
            canEdit={canEdit}
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
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
