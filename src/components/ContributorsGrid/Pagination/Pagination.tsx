/**
 * @file Contains the pagination component for the contributors grid.
 */
import { useMemo } from "react";
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import "./styles.css";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_PAGES_TO_SHOW = 5;

/**
 * Represents the properties of the contributors pagination component.
 */
interface ContributorsPaginationProps {
  /** The current page number. */
  currentPage: number;
  /** The total number of pages. */
  totalPages: number;
  /** Function to call when the page changes. */
  onPageChange: (page: number) => void;
}

/**
 * Pagination component for the contributors grid.
 * @param props - Component properties.
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: ContributorsPaginationProps) => {
  /**
   * Renders the pagination items.
   * @returns The pagination items.
   */
  const renderPaginationItems = useMemo(() => {
    const pages = [];

    // Show all pages if there are less than or equal to MAX_PAGES_TO_SHOW.
    if (totalPages <= MAX_PAGES_TO_SHOW) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={() => onPageChange(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      return pages;
    }

    // Always show the first page.
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          onClick={() => onPageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Calculate start and end pages.
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust start and end pages if they are too close to the edges.
    if (currentPage <= 3) {
      startPage = 2;
      endPage = 5;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
      endPage = totalPages - 1;
    }

    // Show ellipsis if startPage is greater than 2.
    if (startPage > 2) {
      pages.push(<PaginationEllipsis key="start-ellipsis" />);
    }

    // Show page links between startPage and endPage.
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if endPage is less than totalPages - 1.
    if (endPage < totalPages - 1) {
      pages.push(<PaginationEllipsis key="end-ellipsis" />);
    }

    // Always show the last page.
    pages.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          href="#"
          onClick={() => onPageChange(totalPages)}
          isActive={currentPage === totalPages}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );

    return pages;
  }, [currentPage, totalPages, onPageChange]);

  return (
    <UIPagination>
      <PaginationContent className="mb-4">
        {totalPages < 1 ? (
          <Skeleton className="w-[340px] h-9" />
        ) : (
          <>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={currentPage <= 1}
                tabIndex={currentPage <= 1 ? -1 : undefined}
                onClick={() => onPageChange(currentPage - 1)}
                className={`pagination-previous ${
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }`}
              />
            </PaginationItem>
            {renderPaginationItems}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : undefined}
                onClick={() => onPageChange(currentPage + 1)}
                className={`pagination-next ${
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }`}
              />
            </PaginationItem>
          </>
        )}
      </PaginationContent>
    </UIPagination>
  );
};

export default Pagination;
