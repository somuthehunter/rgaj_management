"use client";

import { useEffect, useState } from "react";
import ListControlsBar from "@/components/shared/ListControlsBar";
import { getUser } from "@/services/session.service";
import { UserRole } from "@/types";
import { mockInventoryStores } from "@/services/inventory.service";
import { useProducts } from "../Products/_hooks/useProducts";
import InventoryTable from "./_component/InventoryTable";
import InventoryPagination from "./_component/InventoryPagination";
import InventoryDistributeDialog from "./_component/InventoryDistributeDialog";
import { useInventory } from "./_hooks/useInventory";
import { useInventoryFiltersState } from "./_hooks/useInventoryFiltersState";
import { useInventoryFilterControls } from "./_hooks/useInventoryFilterControls";

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

export default function InventoryPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState("");

  useEffect(() => {
    const user = getUser();
    const normalizedRole = user?.role?.toUpperCase();
    setIsAdmin(
      normalizedRole === UserRole.SUPER_ADMIN || normalizedRole === "ADMIN",
    );
    setUserStoreId(user?.storeId ?? "");
  }, []);

  const filters = useInventoryFiltersState({
    isAdmin,
    userStoreId,
  });

  const { data, isLoading } = useInventory(filters.queryParams);
  const productsQuery = useProducts({ page: 1, limit: 100 });

  const { selectControls } = useInventoryFilterControls({
    inventory: data?.data,
    stores: mockInventoryStores,
    isAdmin,
    selectedStoreId: filters.storeFilter,
    selectedCategory: filters.categoryFilter,
    sortValue: filters.sortValue,
    setStoreFilter: filters.setStoreFilter,
    setCategoryFilter: filters.setCategoryFilter,
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
      <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        {isAdmin && (
          <InventoryDistributeDialog
            products={productsQuery.data?.data}
            stores={mockInventoryStores}
          />
        )}
      </div>

      <ListControlsBar
        searchValue={filters.searchInput}
        onSearchValueChange={filters.setSearchInput}
        searchPlaceholder="Search inventory by product, SKU, or store..."
        onReset={filters.resetFilters}
        selectControls={selectControls}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <InventoryTable inventory={data?.data} />
          <InventoryPagination
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
