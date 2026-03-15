"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ProductPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  from: number;
  to: number;
  pageNumbers: number[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export default function ProductPagination({
  currentPage,
  totalPages,
  totalItems,
  from,
  to,
  pageNumbers,
  canGoPrevious,
  canGoNext,
  onPageChange,
  onPrevious,
  onNext,
}: ProductPaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}-{to} of {totalItems} products
      </p>

      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (canGoPrevious) {
                  onPrevious();
                }
              }}
              className={!canGoPrevious ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>

          {pageNumbers.map((page, index) => {
            const previousPage = pageNumbers[index - 1];
            const showEllipsis = previousPage && page - previousPage > 1;

            return (
              <PaginationItem key={page}>
                {showEllipsis && <PaginationEllipsis />}
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (canGoNext) {
                  onNext();
                }
              }}
              className={!canGoNext ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
