/**
 * @file Displays contributors to the organization repositories.
 */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

/**
 * Organization contributor information.
 */
interface Contributor {
  /** GitHub username */
  username: string;
  /** Whether the user is a new contributor */
  new_contributor: boolean;
  /** Avatar URL */
  avatar_url: string;
  /** Number of contributions */
  contribution_count: number;
  /** Comma-separated commit URLs */
  commit_url: string;
  /** Sponsor information */
  sponsor_info: string;
}

const ITEMS_PER_PAGE = 16;

/**
 * Component that displays a paginated grid of organization contributors.
 * @param props - Component properties.
 */
export const ContributorsGrid = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch contributors from API route.
    fetch("/api/contributors")
      .then((res) => res.json())
      .then((data) => {
        setContributors(data.contributors);
        setLoading(false);
      });
  }, []);

  /**
   * Changes the pagination page.
   * @param page - The page number.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate pagination details and retrieve contributors for the current page.
  const totalPages = Math.ceil(contributors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const selectedContributors = contributors
    .sort((a, b) => b.contribution_count - a.contribution_count)
    .slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const placeholders = Array(ITEMS_PER_PAGE - selectedContributors.length).fill(null);

  return (
    <div className="flex flex-col items-center">
      {loading ? (
        <div className="flex justify-center items-center min-h-[500px]">
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
        </div>
      ) : (
        <>
          {/* Contributors grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full items-start min-h-[500px]">
            {selectedContributors.map((contributor) => (
              <div key={contributor.username} className="flex flex-col items-center">
                <Image
                  src={contributor.avatar_url}
                  alt={contributor.username}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <p className="mt-2 text-center">{contributor.username}</p>
                <p className="text-sm text-gray-500">
                  Contributions: {contributor.contribution_count}
                </p>
              </div>
            ))}
            {/* Add placeholders to maintain grid size */}
            {placeholders.map((_, index) => (
              <div key={`placeholder-${index}`} className="flex flex-col items-center invisible">
                <div className="w-[60px] h-[60px] rounded-full bg-gray-200"></div>
                <p className="mt-2 text-center text-transparent">Placeholder</p>
                <p className="text-sm text-gray-500 text-transparent">
                  Contributions: 0
                </p>
              </div>
            ))}
          </div>
          {/* Pagination widget */}
          <div className="mt-4 flex justify-center w-full">
            <Pagination>
              <PaginationContent>
                {/* Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={currentPage <= 1}
                    tabIndex={currentPage <= 1 ? -1 : undefined}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {/* Pages */}
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      onClick={() => handlePageChange(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={currentPage === totalPages}
                    tabIndex={currentPage === totalPages ? -1 : undefined}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
};

export default ContributorsGrid;
