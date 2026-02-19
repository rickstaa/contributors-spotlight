/**
 * @file Contains the contributors info grid component.
 */
"use client";
import { useEffect, useState } from "react";
import { ORG_NAME } from "@/app/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Footer } from "@/components/ContributorsGrid/Footer";
import { formatCompactNumber, isOrgMember, truncateString } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";
import { ControlPanel } from "./ControlPanel";
import { ContributorCard } from "./ContributorCard";
import { Pagination } from "./Pagination";
import { Contributor, VipContributor } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

// The number of contributors to show per page based on screen size.
const ITEMS_PER_PAGE = {
  default: 3, // Default for mobile
  sm: 6, // Small screens
  md: 9, // Medium screens (tablet)
  lg: 12, // Large screens
  xl: 20, // Extra large screens (desktop)
};

/**
 * Get the number of contributors to show per page based on the screen size.
 * @returns The number of contributors to show per page.
 */
const getItemsPerPage = () => {
  if (typeof window === "undefined") return 0;

  const width = window.innerWidth;
  if (width >= 1280) return ITEMS_PER_PAGE.xl;
  if (width >= 1024) return ITEMS_PER_PAGE.lg;
  if (width >= 768) return ITEMS_PER_PAGE.md;
  if (width >= 640) return ITEMS_PER_PAGE.sm;

  return ITEMS_PER_PAGE.default;
};

/**
 * Fetches the contributors data from the APIs.
 * @returns The contributors data.
 */
const fetchContributorsData = async (): Promise<Contributor[]> => {
  const [contributorsRes, vipContributorsRes] = await Promise.all([
    fetch("/api/contributors"),
    fetch("/api/contributors/vips"),
  ]);

  if (!contributorsRes.ok) {
    throw new Error("Failed to fetch contributors");
  }
  if (!vipContributorsRes.ok) {
    throw new Error("Failed to fetch VIP contributors");
  }

  const contributorsData: Contributor[] = await contributorsRes.json();
  const vipContributorsData: VipContributor[] = await vipContributorsRes.json();

  // Append VIP status and info to contributors
  return contributorsData.map((contributor) => {
    const vipContributor = vipContributorsData.find(
      (vip) => vip.github === contributor.login
    );

    if (vipContributor) {
      return {
        ...contributor,
        is_vip: true,
        vip_info: {
          profile_url: vipContributor.profile_url,
        },
      };
    }

    return contributor;
  });
};

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
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());
  const [loading, setLoading] = useState(true);

  // Layout configuration from query parameters (read-only, not user-toggled)
  const paginationArrows = searchParams.get("paginationArrows") ?? "bottom";
  const sideArrows = paginationArrows === "side";
  const hidePageNumbers = searchParams.get("hidePageNumbers") === "true";

  // Fetch contributors info from the API endpoints.
  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const extendedContributorsData = await fetchContributorsData();
        setContributors(extendedContributorsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
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
    if (excludeOrgMembers) params.set("orgMembers", "false");
    if (displayLastYearContributions) params.set("lastYear", "true");
    if (currentPage > 1) params.set("page", currentPage.toString());

    // Preserve layout configuration params
    if (sideArrows) params.set("paginationArrows", "side");
    if (hidePageNumbers) params.set("hidePageNumbers", "true");

    router.replace(`?${params.toString()}`);
  }, [
    excludeOrgMembers,
    displayLastYearContributions,
    currentPage,
    router,
    sideArrows,
    hidePageNumbers,
  ]);

  // Adjust items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(getItemsPerPage());
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

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage === totalPages;

  const contributorGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full items-start justify-items-start my-6 px-4">
      {loading
        ? Array.from({ length: itemsPerPage }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex flex-col items-center w-full min-w-[125px]"
            >
              <Skeleton className="w-32 h-32 sm:w-28 sm:h-28 md:w-24 md:h-24 lg:w-20 lg:h-20 rounded-full" />
              <Skeleton className="mt-3 w-24 h-4" />
              <Skeleton className="mt-2 w-28 h-4" />
            </div>
          ))
        : selectedContributors.map((contributor) => {
            const truncatedName = truncateString(contributor.login, 14);
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
                    className={`w-32 h-32 sm:w-28 sm:h-28 md:w-24 md:h-24 lg:w-20 lg:h-20 border-2 ${
                      isOrgMember(contributor, ORG_NAME) && contributor.is_vip
                        ? "border-t-livepeer border-b-yellow-600 border-l-livepeer border-r-yellow-600"
                        : isOrgMember(contributor, ORG_NAME)
                        ? "border-livepeer"
                        : contributor.is_vip
                        ? "border-yellow-600"
                        : ""
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
                      <a
                        href={`https://github.com/${contributor.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <p
                          className={`mt-2 text-center ${
                            isOrgMember(contributor, ORG_NAME)
                              ? "text-livepeer"
                              : ""
                          }`}
                        >
                          {truncatedName}
                        </p>
                      </a>
                    </TooltipTrigger>
                    {isTruncated && (
                      <TooltipContent>{contributor.login}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <a
                  href={`https://github.com/search?q=org%3Alivepeer+author%3A${contributor.login}&type=commits`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className="text-sm text-gray-500">
                    Contributions:{" "}
                    {formatCompactNumber(
                      displayLastYearContributions
                        ? contributor.yearly_contributions
                        : contributor.contributions
                    )}
                  </p>
                </a>
              </div>
            );
          })}
      {/* Add placeholders to fill the empty spaces */}
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {/* Control Panel */}
      <ControlPanel
        excludeOrgMembers={excludeOrgMembers}
        displayLastYearContributions={displayLastYearContributions}
        setExcludeOrgMembers={setExcludeOrgMembers}
        setDisplayLastYearContributions={setDisplayLastYearContributions}
      />
      {/* Contributor Grid (with optional side arrows) */}
      {sideArrows ? (
        <div className="flex items-center w-full">
          <button
            aria-label="Go to previous page"
            disabled={isPrevDisabled}
            onClick={() => handlePageChange(currentPage - 1)}
            className={`flex-shrink-0 p-2 rounded-full border border-muted-foreground/20 bg-muted/40 transition-colors ${
              isPrevDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-accent hover:border-muted-foreground/40 cursor-pointer"
            }`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1 min-w-0">{contributorGrid}</div>
          <button
            aria-label="Go to next page"
            disabled={isNextDisabled}
            onClick={() => handlePageChange(currentPage + 1)}
            className={`flex-shrink-0 p-2 rounded-full border border-muted-foreground/20 bg-muted/40 transition-colors ${
              isNextDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-accent hover:border-muted-foreground/40 cursor-pointer"
            }`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      ) : (
        contributorGrid
      )}
      {/* Pagination widget */}
      {!(sideArrows && hidePageNumbers) && (
        <div className="flex justify-center w-full">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            hideArrows={sideArrows}
            hidePageNumbers={hidePageNumbers}
          />
        </div>
      )}
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContributorsGrid;
