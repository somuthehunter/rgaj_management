"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ListControlsBar from "@/components/shared/ListControlsBar";
import { Button } from "@/components/ui/button";
import { getUser } from "@/services/session.service";
import { UserRole } from "@/types";
import { normalizeRole } from "@/lib/auth";
import { useStores } from "../Stores/_hooks/useStores";
import { productService } from "@/services/product.service";
import InventoryTable from "./_component/InventoryTable";
import CentralInventoryTable from "./_component/CentralInventoryTable";
import InventoryPagination from "./_component/InventoryPagination";
import InventoryDistributeDialog from "./_component/InventoryDistributeDialog";
import InventoryReceiveStockDialog from "./_component/InventoryReceiveStockDialog";
import { useInventory } from "./_hooks/useInventory";
import { useInventoryFiltersState } from "./_hooks/useInventoryFiltersState";
import { useInventoryFilterControls } from "./_hooks/useInventoryFilterControls";
import { inventoryService } from "@/services/inventory.service";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [centralPage, setCentralPage] = useState(1);
  const [centralOpen, setCentralOpen] = useState(true);
  const [storeOpen, setStoreOpen] = useState(true);

  useEffect(() => {
    const user = getUser();
    const normalizedRole = normalizeRole(user?.role);
    setIsAdmin(normalizedRole === UserRole.SUPER_ADMIN);
    setUserStoreId(user?.storeId ?? "");
  }, []);

  const filters = useInventoryFiltersState({
    isAdmin,
    userStoreId,
  });

  const { data, isLoading, isError, error } = useInventory(filters.queryParams);
  const centralInventoryQuery = useQuery({
    queryKey: ["central-inventory-list", centralPage],
    queryFn: () => inventoryService.getCentralInventory(centralPage, 10),
    enabled: isAdmin,
  });
  const allProductsQuery = useQuery({
    queryKey: ["inventory-product-options"],
    queryFn: async () => {
      const res = await productService.getAll({ page: 1, limit: 100, isActive: true });
      return res.data;
    },
    enabled: isAdmin,
  });
  const centralProductsQuery = useQuery({
    queryKey: ["central-inventory-products"],
    queryFn: () => inventoryService.getCentralProducts(),
    enabled: isAdmin,
  });
  const storesQuery = useStores({ page: 1, limit: 100, isActive: true });

  const { selectControls } = useInventoryFilterControls({
    inventory: data?.data,
    stores: storesQuery.data?.data ?? [],
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
  const centralCurrentPage = centralInventoryQuery.data?.page ?? centralPage;
  const centralTotalItems = centralInventoryQuery.data?.total ?? 0;
  const centralItemsPerPage = centralInventoryQuery.data?.limit ?? 10;
  const centralTotalPages = Math.max(1, Math.ceil(centralTotalItems / centralItemsPerPage));
  const centralFrom =
    centralTotalItems === 0 ? 0 : (centralCurrentPage - 1) * centralItemsPerPage + 1;
  const centralTo = Math.min(centralCurrentPage * centralItemsPerPage, centralTotalItems);
  const centralPageNumbers = buildPageNumbers(centralCurrentPage, centralTotalPages);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <InventoryReceiveStockDialog products={allProductsQuery.data ?? []} />
            <InventoryDistributeDialog
              products={centralProductsQuery.data ?? []}
              stores={storesQuery.data?.data ?? []}
            />
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="rounded-lg border bg-card">
          <button
            type="button"
            onClick={() => setCentralOpen((value) => !value)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div>
              <h2 className="text-lg font-semibold">Central Stocks</h2>
              <p className="text-sm text-muted-foreground">
                Stock received into central inventory before store allocation.
              </p>
            </div>
            {centralOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {centralOpen && (
            <div className="space-y-4 border-t px-4 py-4">
              {centralInventoryQuery.isLoading ? (
                <p>Loading central stock...</p>
              ) : centralInventoryQuery.isError ? (
                <p className="text-sm text-destructive">
                  {centralInventoryQuery.error instanceof Error
                    ? centralInventoryQuery.error.message
                    : "Failed to load central inventory."}
                </p>
              ) : (
                <>
                  <CentralInventoryTable inventory={centralInventoryQuery.data?.data} />
                  <InventoryPagination
                    currentPage={centralCurrentPage}
                    totalPages={centralTotalPages}
                    totalItems={centralTotalItems}
                    from={centralFrom}
                    to={centralTo}
                    pageNumbers={centralPageNumbers}
                    canGoPrevious={centralCurrentPage > 1}
                    canGoNext={centralCurrentPage < centralTotalPages}
                    onPageChange={setCentralPage}
                    onPrevious={() => setCentralPage(Math.max(1, centralCurrentPage - 1))}
                    onNext={() => setCentralPage(Math.min(centralTotalPages, centralCurrentPage + 1))}
                    label="central stock records"
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <button
          type="button"
          onClick={() => setStoreOpen((value) => !value)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div>
            <h2 className="text-lg font-semibold">Store Stocks</h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Browse stock allocated to stores and filter by branch."
                : "View stock currently allocated to your store."}
            </p>
          </div>
          {storeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {storeOpen && (
          <div className="space-y-4 border-t px-4 py-4">
            <ListControlsBar
              searchValue={filters.searchInput}
              onSearchValueChange={filters.setSearchInput}
              searchPlaceholder="Search inventory by product, SKU, or store..."
              onReset={filters.resetFilters}
              selectControls={selectControls}
            />

            {isLoading ? (
              <p>Loading...</p>
            ) : isError ? (
              <p className="text-sm text-destructive">
                {error instanceof Error ? error.message : "Failed to load inventory."}
              </p>
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
                  label="store stock records"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
