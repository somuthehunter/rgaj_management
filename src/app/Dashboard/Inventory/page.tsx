"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ListControlsBar from "@/components/shared/ListControlsBar";
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
import InventoryAdjustStockDialog from "./_component/InventoryAdjustStockDialog";
import InventoryTransferDialog from "./_component/InventoryTransferDialog";
import InventorySummaryTable from "./_component/InventorySummaryTable";
import InventoryLedgerTable from "./_component/InventoryLedgerTable";
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

const buildRange = (currentPage: number, itemsPerPage: number, totalItems: number) => ({
  from: totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
  to: Math.min(currentPage * itemsPerPage, totalItems),
});

export default function InventoryPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStoreId, setUserStoreId] = useState("");
  const [centralPage, setCentralPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerType, setLedgerType] = useState("");
  const [ledgerStoreId, setLedgerStoreId] = useState("");
  const [ledgerProductId, setLedgerProductId] = useState("");
  const [ledgerFromDate, setLedgerFromDate] = useState("");
  const [ledgerToDate, setLedgerToDate] = useState("");
  const [centralOpen, setCentralOpen] = useState(true);
  const [storeOpen, setStoreOpen] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [ledgerOpen, setLedgerOpen] = useState(true);

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
  const inventorySummaryQuery = useQuery({
    queryKey: ["inventory-summary"],
    queryFn: () => inventoryService.getSummary(),
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
  const adminInventoryQuery = useQuery({
    queryKey: ["inventory-transfer-options"],
    queryFn: () => inventoryService.getAll({ page: 1, limit: 100 }),
    enabled: isAdmin,
  });
  const centralProductsQuery = useQuery({
    queryKey: ["central-inventory-products"],
    queryFn: () => inventoryService.getCentralProducts(),
    enabled: isAdmin,
  });
  const storesQuery = useStores({ page: 1, limit: 100, isActive: true });
  const ledgerQuery = useQuery({
    queryKey: [
      "inventory-ledger",
      ledgerPage,
      ledgerType,
      ledgerStoreId,
      ledgerProductId,
      ledgerFromDate,
      ledgerToDate,
    ],
    queryFn: () =>
      inventoryService.getLedger({
        page: ledgerPage,
        limit: 10,
        type: ledgerType as "ALLOCATION" | "SALE" | "REFUND" | "ADJUSTMENT" | "",
        storeId: ledgerStoreId || undefined,
        productId: ledgerProductId || undefined,
        fromDate: ledgerFromDate || undefined,
        toDate: ledgerToDate || undefined,
      }),
    enabled: isAdmin,
  });
  const ledgerSummaryQuery = useQuery({
    queryKey: ["inventory-ledger-summary", ledgerProductId],
    queryFn: () => inventoryService.getLedgerSummary(ledgerProductId || undefined),
    enabled: isAdmin,
  });

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
  const storeRange = buildRange(currentPage, itemsPerPage, totalItems);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  const centralCurrentPage = centralInventoryQuery.data?.page ?? centralPage;
  const centralTotalItems = centralInventoryQuery.data?.total ?? 0;
  const centralItemsPerPage = centralInventoryQuery.data?.limit ?? 10;
  const centralTotalPages = Math.max(1, Math.ceil(centralTotalItems / centralItemsPerPage));
  const centralRange = buildRange(centralCurrentPage, centralItemsPerPage, centralTotalItems);
  const centralPageNumbers = buildPageNumbers(centralCurrentPage, centralTotalPages);

  const ledgerCurrentPage = ledgerQuery.data?.page ?? ledgerPage;
  const ledgerTotalItems = ledgerQuery.data?.total ?? 0;
  const ledgerItemsPerPage = ledgerQuery.data?.limit ?? 10;
  const ledgerTotalPages = Math.max(1, Math.ceil(ledgerTotalItems / ledgerItemsPerPage));
  const ledgerRange = buildRange(ledgerCurrentPage, ledgerItemsPerPage, ledgerTotalItems);
  const ledgerPageNumbers = buildPageNumbers(ledgerCurrentPage, ledgerTotalPages);

  const storeInventoryRows = useMemo(
    () => adminInventoryQuery.data?.data ?? [],
    [adminInventoryQuery.data?.data],
  );
  const ledgerTypeOptions = ["ALLOCATION", "SALE", "REFUND", "ADJUSTMENT"] as const;

  const productOptions = useMemo(() => {
    const centralRows = centralInventoryQuery.data?.data ?? [];
    const storeRows = storeInventoryRows;
    const seen = new Map<string, string>();

    centralRows.forEach((item) => {
      seen.set(item.productId, `${item.productName} (${item.productSku})`);
    });
    storeRows.forEach((item) => {
      if (!seen.has(item.productId)) {
        seen.set(item.productId, `${item.productName} (${item.productSku})`);
      }
    });

    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [centralInventoryQuery.data?.data, storeInventoryRows]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <InventoryReceiveStockDialog products={allProductsQuery.data ?? []} />
            <InventoryDistributeDialog
              products={centralProductsQuery.data ?? []}
              stores={storesQuery.data?.data ?? []}
            />
            <InventoryTransferDialog
              stores={storesQuery.data?.data ?? []}
              inventory={storeInventoryRows}
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
                  <CentralInventoryTable
                    inventory={centralInventoryQuery.data?.data}
                    renderActions={(item) => (
                      <InventoryAdjustStockDialog
                        productId={item.productId}
                        productName={item.productName}
                      />
                    )}
                  />
                  <InventoryPagination
                    currentPage={centralCurrentPage}
                    totalPages={centralTotalPages}
                    totalItems={centralTotalItems}
                    from={centralRange.from}
                    to={centralRange.to}
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

      {isAdmin && (
        <div className="rounded-lg border bg-card">
          <button
            type="button"
            onClick={() => setSummaryOpen((value) => !value)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div>
              <h2 className="text-lg font-semibold">Inventory Summary</h2>
              <p className="text-sm text-muted-foreground">
                Compare allocated, sold, available, and returned stock across stores.
              </p>
            </div>
            {summaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {summaryOpen && (
            <div className="border-t px-4 py-4">
              {inventorySummaryQuery.isLoading ? (
                <p>Loading inventory summary...</p>
              ) : inventorySummaryQuery.isError ? (
                <p className="text-sm text-destructive">
                  {inventorySummaryQuery.error instanceof Error
                    ? inventorySummaryQuery.error.message
                    : "Failed to load inventory summary."}
                </p>
              ) : (
                <InventorySummaryTable summary={inventorySummaryQuery.data?.data} />
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
                  from={storeRange.from}
                  to={storeRange.to}
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

      {isAdmin && (
        <div className="rounded-lg border bg-card">
          <button
            type="button"
            onClick={() => setLedgerOpen((value) => !value)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div>
              <h2 className="text-lg font-semibold">Inventory Ledger</h2>
              <p className="text-sm text-muted-foreground">
                Review allocations, sales, refunds, and manual stock adjustments.
              </p>
            </div>
            {ledgerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {ledgerOpen && (
            <div className="space-y-4 border-t px-4 py-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={ledgerType}
                    onChange={(event) => {
                      setLedgerType(event.target.value);
                      setLedgerPage(1);
                    }}
                  >
                    <option value="">All types</option>
                    {ledgerTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Store</label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={ledgerStoreId}
                    onChange={(event) => {
                      setLedgerStoreId(event.target.value);
                      setLedgerPage(1);
                    }}
                  >
                    <option value="">All stores</option>
                    {(storesQuery.data?.data ?? []).map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Product</label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={ledgerProductId}
                    onChange={(event) => {
                      setLedgerProductId(event.target.value);
                      setLedgerPage(1);
                    }}
                  >
                    <option value="">All products</option>
                    {productOptions.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <input
                    type="date"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={ledgerFromDate}
                    onChange={(event) => {
                      setLedgerFromDate(event.target.value);
                      setLedgerPage(1);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <input
                    type="date"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={ledgerToDate}
                    onChange={(event) => {
                      setLedgerToDate(event.target.value);
                      setLedgerPage(1);
                    }}
                  />
                </div>
              </div>

              {ledgerQuery.isLoading ? (
                <p>Loading inventory ledger...</p>
              ) : ledgerQuery.isError ? (
                <p className="text-sm text-destructive">
                  {ledgerQuery.error instanceof Error
                    ? ledgerQuery.error.message
                    : "Failed to load inventory ledger."}
                </p>
              ) : (
                <>
                  <InventoryLedgerTable
                    entries={ledgerQuery.data?.data}
                    summary={ledgerSummaryQuery.data?.data}
                  />
                  <InventoryPagination
                    currentPage={ledgerCurrentPage}
                    totalPages={ledgerTotalPages}
                    totalItems={ledgerTotalItems}
                    from={ledgerRange.from}
                    to={ledgerRange.to}
                    pageNumbers={ledgerPageNumbers}
                    canGoPrevious={ledgerCurrentPage > 1}
                    canGoNext={ledgerCurrentPage < ledgerTotalPages}
                    onPageChange={setLedgerPage}
                    onPrevious={() => setLedgerPage(Math.max(1, ledgerCurrentPage - 1))}
                    onNext={() => setLedgerPage(Math.min(ledgerTotalPages, ledgerCurrentPage + 1))}
                    label="ledger entries"
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
