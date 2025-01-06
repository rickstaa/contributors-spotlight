/**
 * @file Contains the contributors info grid component.
 */
"use client";
import { ORG_NAME } from "@/app/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useLocalStorage } from "usehooks-ts";
import { ControlPanel } from "./ControlPanel";
import { ContributorCard } from "./ContributorCard";
import { Pagination } from "./Pagination";

const ITEMS_PER_PAGE_DESKTOP = 20;
const ITEMS_PER_PAGE_TABLET = 9;
const ITEMS_PER_PAGE_MOBILE = 3;

/**
 * Component that displays a paginated grid of organization contributors.
 * @param props - Component properties.
 */
export const ContributorsGrid = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [excludeOrgMembers, setExcludeOrgMembers] = useLocalStorage(
    "orgMembers",
    false
  );
  const [displayLastYearContributions, setDisplayLastYearContributions] =
    useLocalStorage("lastYear", false);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DESKTOP);
  const [loading, setLoading] = useState(true);

  // Fetch contributors from the API.
  useEffect(() => {
    const fetchContributors = async () => {
      setLoading(true);
      const res = await fetch("/api/contributors");
      if (!res.ok) {
        throw new Error("Failed to fetch contributors");
      }
      const data = await res.json();
      setContributors(data || []);
      setLoading(false);
    };

    fetchContributors();
  }, []);

  // Overwrite state with query parameters if they are present
  useEffect(() => {
    const showOrgMembers = searchParams.get("orgMembers");
    const yearlyContribParam = searchParams.get("lastYear");
    const pageParam = searchParams.get("page");

    if (showOrgMembers !== null) {
      setExcludeOrgMembers(showOrgMembers !== "true");
    }

    if (yearlyContribParam !== null) {
      setDisplayLastYearContributions(yearlyContribParam === "true");
    }

    if (pageParam !== null) {
      setCurrentPage(parseInt(pageParam, 10) || 1);
    }
  }, [
    searchParams,
    setExcludeOrgMembers,
    setDisplayLastYearContributions,
    setCurrentPage,
  ]);

  // Update the URL query params when the state changes.
  useEffect(() => {
    const params = new URLSearchParams();
    if (excludeOrgMembers) {
      params.set("orgMembers", "false");
    }
    if (displayLastYearContributions) {
      params.set("lastYear", "true");
    }
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }
    router.replace(`?${params.toString()}`);
  }, [excludeOrgMembers, displayLastYearContributions, currentPage, router]);

  // Adjust items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(ITEMS_PER_PAGE_MOBILE);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(ITEMS_PER_PAGE_TABLET);
      } else {
        setItemsPerPage(ITEMS_PER_PAGE_DESKTOP);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

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
  const totalPages = Math.ceil(filteredContributors.length / itemsPerPage);

  // Adjust current page if it is out of range.
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [totalPages, currentPage]);

  // Calculate contributors for the current page.
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedContributors = filteredContributors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Calculate the number of placeholders needed.
  const placeholdersCount = itemsPerPage - selectedContributors.length;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full items-center my-6 px-4">
        {loading
          ? Array.from({ length: itemsPerPage }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex flex-col items-center w-full min-w-[125px]"
              >
                <Skeleton className="w-32 h-32 sm:w-28 sm:h-28 md:w-24 md:h-24 lg:w-20 lg:h-20" />
                <Skeleton className="mt-3 w-24 h-4" />
                <Skeleton className="mt-2 w-32 h-4" />
              </div>
            ))
          : selectedContributors.map((contributor) => {
              const truncatedName = truncateString(contributor.login, 15);
              const isTruncated = truncatedName !== contributor.login;

              return (
                <div
                  key={contributor.login}
                  className="flex flex-col items-center w-full min-w-[125px]"
                >
                  <ContributorCard
                    key={contributor.login}
                    contributor={contributor}
                  >
                    <Avatar
                      className={`w-32 h-32 sm:w-28 sm:h-28 md:w-24 md:h-24 lg:w-20 lg:h-20 ${
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
                        {contributor.login.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </ContributorCard>
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
        {!loading &&
          Array.from({ length: placeholdersCount }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="flex flex-col items-center w-full min-w-[125px]"
            />
          ))}
      </div>
      {/* Pagination widget */}
      <div className="flex justify-center w-full">
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
