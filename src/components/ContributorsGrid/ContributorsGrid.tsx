/**
 * @file Contains the contributors info grid component.
 */
"use client";
import tailwindConfig from "@/../tailwind.config";
import { ORG_NAME } from "@/app/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCompactNumber, isOrgMember, truncateString } from "@/lib/utils";
import { Contributor } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import resolveConfig from "tailwindcss/resolveConfig";
import { useLocalStorage } from "usehooks-ts";
import { ControlPanel } from "./ControlPanel";
import { HoverCard } from "./HoverCard";
import { Pagination } from "./Pagination";
const twConfig = resolveConfig(tailwindConfig);

const ITEMS_PER_PAGE = 16;

/**
 * Component that displays a paginated grid of organization contributors.
 * @param props - Component properties.
 */
export const ContributorsGrid = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excludeOrgMembers, setExcludeOrgMembers] = useLocalStorage(
    "excludeOrgMembers",
    false
  );
  const [displayLastYearContributions, setDisplayLastYearContributions] =
    useLocalStorage("displayLastYearContributions", false);

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

  // Overwrite state with query parameters if they are present
  useEffect(() => {
    const excludeOrgParam = searchParams.get("excludeOrgMembers");
    const yearlyContribParam = searchParams.get("lastYearContrib");

    if (excludeOrgParam !== null) {
      setExcludeOrgMembers(excludeOrgParam === "true");
    }

    if (yearlyContribParam !== null) {
      setDisplayLastYearContributions(yearlyContribParam === "true");
    }
  }, [searchParams, setExcludeOrgMembers, setDisplayLastYearContributions]);

  // Update the URL query params when the state changes.
  useEffect(() => {
    const params = new URLSearchParams();
    if (excludeOrgMembers) {
      params.set("excludeOrgMembers", "true");
    }
    if (displayLastYearContributions) {
      params.set("lastYearContrib", "true");
    }
    router.replace(`?${params.toString()}`);
  }, [excludeOrgMembers, displayLastYearContributions, router]);

  /**
   * Changes the pagination page.
   * @param page - The page number.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate filtered and sorted contributors based on the state.
  const filteredContributors = contributors
    .filter(
      (contributor) => !excludeOrgMembers || !isOrgMember(contributor, ORG_NAME)
    )
    .filter(
      (contributor) =>
        !displayLastYearContributions || contributor.yearly_contributions > 0
    )
    .sort((a, b) =>
      displayLastYearContributions
        ? b.yearly_contributions - a.yearly_contributions
        : b.contributions - a.contributions
    );

  // Calculate pagination details.
  const totalPages = Math.ceil(filteredContributors.length / ITEMS_PER_PAGE);

  // Adjust current page if it is out of range.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [totalPages, currentPage]);

  // Calculate contributors for the current page.
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const selectedContributors = filteredContributors.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Calculate the number of placeholders needed.
  const placeholdersCount = ITEMS_PER_PAGE - selectedContributors.length;

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
      {/* Control Panel */}
      <ControlPanel
        excludeOrgMembers={excludeOrgMembers}
        displayLastYearContributions={displayLastYearContributions}
        setExcludeOrgMembers={setExcludeOrgMembers}
        setDisplayLastYearContributions={setDisplayLastYearContributions}
      />
      {/* Contributor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-4 w-full items-start min-h-[500px] mt-4">
        {selectedContributors.map((contributor) => {
          const truncatedName = truncateString(contributor.login, 15);
          const isTruncated = truncatedName !== contributor.login;

          return (
            <div
              key={contributor.login}
              className="flex flex-col items-center w-32 h-32"
            >
              <HoverCard key={contributor.login} contributor={contributor}>
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
              </HoverCard>
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
                Contributions:{" "}
                {formatCompactNumber(
                  displayLastYearContributions
                    ? contributor.yearly_contributions
                    : contributor.contributions
                )}
              </p>
            </div>
          );
        })}
        {/* Add placeholders to fill the empty spaces */}
        {Array.from({ length: placeholdersCount }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="flex flex-col items-center w-32 h-32"
          />
        ))}
      </div>
      {/* Pagination widget */}
      <div className="mt-4 flex justify-center w-full">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ContributorsGrid;
