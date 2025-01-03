/**
 * @file Contains the contributors info grid component.
 */
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Contributor } from "@/types";
import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { isOrgMember, formatCompactNumber, truncateString } from "@/lib/utils";
import { ContributorHoverCard } from "./ContributorHoverCard";
import { ContributorsPagination } from "./ContributorsPagination";
import { ORG_NAME } from "@/app/config";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";
const twConfig = resolveConfig(tailwindConfig);

const ITEMS_PER_PAGE = 16;

/**
 * Component that displays a paginated grid of organization contributors.
 * @param props - Component properties.
 */
export const ContributorsGrid = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contributors from the API.
  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const res = await fetch("/api/contributors");
        if (!res.ok) {
          throw new Error("Failed to fetch contributors");
        }
        const data = await res.json();
        setContributors(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, []);

  /**
   * Changes the pagination page.
   * @param page - The page number.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate pagination details and retrieve contributors for the current page.
  const totalPages = Math.ceil((contributors?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const selectedContributors = (contributors || [])
    .sort((a, b) => b.contributions - a.contributions)
    .slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Render loading spinner or error message if needed.
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <ClipLoader
          color={twConfig.theme.colors.livepeer}
          size={50}
          loading={loading}
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[500px]">
        <FaExclamationTriangle className="text-red-500 text-6xl mb-4" />
        <h1 className="text-red-500 text-2xl">Oops! Something went wrong.</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-4 w-full items-start min-h-[500px]">
        {selectedContributors.map((contributor) => {
          const truncatedName = truncateString(contributor.login, 15);
          const isTruncated = truncatedName !== contributor.login;

          return (
            <div
              key={contributor.login}
              className="flex flex-col items-center w-32 h-32"
            >
              <ContributorHoverCard
                key={contributor.login}
                contributor={contributor}
              >
                <a
                  href={`https://github.com/${contributor.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform transition-transform duration-300 hover:scale-110"
                >
                  <Avatar
                    className={`w-14 h-14 ${
                      isOrgMember(contributor, ORG_NAME)
                        ? "border-2 border-livepeer"
                        : "border-2"
                    }`}
                  >
                    <AvatarImage
                      src={contributor.avatar_url}
                      alt={contributor.login}
                    />
                    <AvatarFallback className="w-full h-full">
                      {contributor.login[0]}
                    </AvatarFallback>
                  </Avatar>
                </a>
              </ContributorHoverCard>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p
                      className={`mt-2 text-center ${
                        isOrgMember(contributor, ORG_NAME)
                          ? "text-livepeer"
                          : ""
                      }`}
                    >
                      {truncatedName}
                    </p>
                  </TooltipTrigger>
                  {isTruncated && (
                    <TooltipContent>{contributor.login}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-gray-500">
                Contributions: {formatCompactNumber(contributor.contributions)}
              </p>
            </div>
          );
        })}
      </div>
      {/* Pagination widget */}
      <div className="mt-4 flex justify-center w-full">
        <ContributorsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ContributorsGrid;
