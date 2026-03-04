"use client";

import AddProductDialog from "./_component/AddProductDialog";
import ProductTable from "./_component/ProductTable";
import { useProducts } from "./_hooks/useProducts";
import { getUser } from "@/services/session.service";
import { UserRole } from "@/types";
import ListControlsBar from "@/components/shared/ListControlsBar";
import { useProductActions } from "./_hooks/useProductActions";
import { useProductFiltersState } from "./_hooks/useProductFiltersState";
import { useProductFilterControls } from "./_hooks/useProductFilterControls";

export default function ProductsPage() {
  const user = getUser();
  const normalizedRole = user?.role?.toUpperCase();
  const isAdmin =
    normalizedRole === UserRole.SUPER_ADMIN || normalizedRole === "ADMIN";

  const filters = useProductFiltersState();
  const { data, isLoading } = useProducts(filters.queryParams);
  const { selectControls } = useProductFilterControls({
    products: data,
    categoryFilter: filters.categoryFilter,
    statusFilter: filters.statusFilter,
    sortValue: filters.sortValue,
    setCategoryFilter: filters.setCategoryFilter,
    setStatusFilter: filters.setStatusFilter,
    setSortValue: filters.setSortValue,
  });

  const { handleDeactivate, handleActivate, handleReturn } = useProductActions();

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
        <ProductTable
          products={data}
          isAdmin={isAdmin}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
          onReturn={handleReturn}
        />
      )}
    </div>
  );
}
