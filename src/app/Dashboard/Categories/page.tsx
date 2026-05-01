"use client";

import { useEffect, useState } from "react";
import AddCategoryDialog from "./_component/AddCategoryDialog";
import CategoryPagination from "./_component/CategoryPagination";
import CategoryTable from "./_component/CategoryTable";
import ListControlsBar from "@/components/shared/ListControlsBar";
import { useCategoryActions } from "./_hooks/useCategoryActions";
import { useCategoryFilterControls } from "./_hooks/useCategoryFilterControls";
import { useCategoryFiltersState } from "./_hooks/useCategoryFiltersState";
import { useCategories } from "./_hooks/useCategories";
import { getUser } from "@/services/session.service";
import { normalizeRole } from "@/lib/auth";
import { UserRole } from "@/types";

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

export default function CategoriesPage() {
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    const normalizedRole = normalizeRole(getUser()?.role);
    setCanManage(normalizedRole === UserRole.SUPER_ADMIN);
  }, []);

  const filters = useCategoryFiltersState();
  const { data, isLoading } = useCategories(filters.queryParams);
  const { selectControls } = useCategoryFilterControls({
    statusFilter: filters.statusFilter,
    sortValue: filters.sortValue,
    setStatusFilter: filters.setStatusFilter,
    setSortValue: filters.setSortValue,
  });
  const { handleActivate, handleDeactivate } = useCategoryActions();

  const currentPage = data?.page ?? filters.page;
  const totalItems = data?.total ?? 0;
  const itemsPerPage = data?.limit ?? filters.queryParams.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        {canManage ? <AddCategoryDialog /> : null}
      </div>

      <ListControlsBar
        searchValue={filters.searchInput}
        onSearchValueChange={filters.setSearchInput}
        searchPlaceholder="Search categories by name or description..."
        onReset={filters.resetFilters}
        selectControls={selectControls}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <CategoryTable
            categories={data?.data}
            canManage={canManage}
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
          />
          <CategoryPagination
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
