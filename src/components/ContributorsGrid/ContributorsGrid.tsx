/**
 * @file Contains the contributors info grid component.
 */
"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
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
import { Button } from "@/components/ui/button";

// The number of contributors to show per page based on screen size.
const ITEMS_PER_PAGE = {
  default: 3, // Default for mobile
  sm: 6, // Small screens
  md: 9, // Medium screens (tablet)
  lg: 12, // Large screens 
  xl: 20, // Extra large screens (desktop)
};

// Add scroll speed configuration
const SCROLL_SPEEDS = {
  slow: 15000,    // 15 seconds per transition
  medium: 8000,   // 8 seconds per transition
  fast: 2000      // 3 seconds per transition
};

const RANDOM_INTERVALS = {
  slow: 12000,    // New random order every 12 seconds
  medium: 6000,   // New random order every 6 seconds
  fast: 2000      // New random order every 3 seconds
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
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const [randomSeed, setRandomSeed] = useState(() => Math.floor(Math.random() * 1000));
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get display parameters from URL
  const { rows, random, scrollSpeed, randomSpeed } = useMemo(() => {
    const rowsParam = searchParams.get('rows');
    const randomParam = searchParams.get('random');
    const speedParam = searchParams.get('scrollSpeed');
    const randomSpeedParam = searchParams.get('randomSpeed');
    
    return {
      rows: rowsParam ? parseInt(rowsParam, 10) : null,
      random: randomParam === 'true',
      scrollSpeed: SCROLL_SPEEDS[speedParam as keyof typeof SCROLL_SPEEDS] || SCROLL_SPEEDS.slow,
      randomSpeed: RANDOM_INTERVALS[randomSpeedParam as keyof typeof RANDOM_INTERVALS] || RANDOM_INTERVALS.medium,
    };
  }, [searchParams]);

  // Set random mode based on URL param
  useEffect(() => {
    setIsRandomMode(random);
    setAutoScrollEnabled(random);
  }, [random]);

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
    const params = new URLSearchParams(searchParams.toString());
    if (excludeOrgMembers) {
      params.set("orgMembers", "false");
    } else {
      params.delete("orgMembers");
    }
    if (displayLastYearContributions) {
      params.set("lastYear", "true");
    } else {
      params.delete("lastYear");
    }
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    } else {
      params.delete("page");
    }
    router.replace(`?${params.toString()}`);
  }, [excludeOrgMembers, displayLastYearContributions, currentPage, router, searchParams]);

  // Adjust items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      // If rows parameter is specified, calculate items per page based on that
      if (rows) {
        const cols = getColumnsCount();
        setItemsPerPage(rows * cols);
      } else {
        setItemsPerPage(getItemsPerPage());
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, [rows]);

  // Get number of columns based on screen size
  const getColumnsCount = () => {
    if (typeof window === "undefined") return 4;
    const width = window.innerWidth;
    if (width >= 1280) return 5; // xl
    if (width >= 1024) return 4; // lg
    if (width >= 768) return 3;  // md
    if (width >= 640) return 2;  // sm
    return 1;                    // default
  };

  // Automatic randomization effect with smooth transition for random mode
  useEffect(() => {
    if (!isRandomMode || !autoScrollEnabled) return;

    const randomInterval = setInterval(() => {
      setIsTransitioning(true);
      // Wait for exit animation
      setTimeout(() => {
        setRandomSeed(Math.floor(Math.random() * 1000));
        // Wait a frame before starting entry animation
        requestAnimationFrame(() => {
          setIsTransitioning(false);
        });
      }, 500); // Half of our transition duration
    }, randomSpeed);

    return () => clearInterval(randomInterval);
  }, [isRandomMode, autoScrollEnabled, randomSpeed]);

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

  // Define seededShuffle function for random mode
  const seededShuffle = (array: any[], seed: number) => {
    const shuffled = [...array];
    let currentSeed = seed;

    // Linear Congruential Generator
    const random = () => {
      currentSeed = (1103515245 * currentSeed + 12345) % 2147483647;
      return currentSeed / 2147483647;
    };

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  };

  // Get contributors to display based on mode
  const displayContributors = useMemo(() => {
    if (isRandomMode) {
      // In random mode, show exactly the number of columns for the current screen size
      return seededShuffle(filteredContributors, randomSeed).slice(0, getColumnsCount());
    } else {
      // In normal mode, use pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredContributors.slice(startIndex, startIndex + itemsPerPage);
    }
  }, [filteredContributors, isRandomMode, randomSeed, currentPage, itemsPerPage]);

  // Handle page changes for pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    if (isRandomMode) {
      setAutoScrollEnabled(false);
    }
  }, [isRandomMode]);

  // Determine grid columns based on screen size or rows parameter
  const gridColumnsClass = useMemo(() => {
    if (isRandomMode) {
      // In random mode, always use a single row with columns based on screen size
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    } else {
      // In normal mode, use responsive grid
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    }
  }, [isRandomMode]);

  return (
    <div className="flex flex-col items-center">
      <ControlPanel
        excludeOrgMembers={excludeOrgMembers}
        displayLastYearContributions={displayLastYearContributions}
        setExcludeOrgMembers={setExcludeOrgMembers}
        setDisplayLastYearContributions={setDisplayLastYearContributions}
      />

      {isRandomMode ? (
        // Random Mode - Carousel View
        <div className="relative w-full my-6 px-16 overflow-hidden">
          {/* Left Navigation */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90"
            onClick={() => {
              setIsTransitioning(true);
              setAutoScrollEnabled(false);
              setTimeout(() => {
                setRandomSeed(Math.floor(Math.random() * 1000));
                setIsTransitioning(false);
              }, 500);
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Contributors Grid - Changed to flex row for random mode */}
          <div 
            className={`
              flex transition-all duration-1000 ease-in-out
              ${isTransitioning ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
            `}
            onMouseEnter={() => setAutoScrollEnabled(false)}
            onMouseLeave={() => setAutoScrollEnabled(true)}
          >
            <div className="flex flex-row justify-between gap-6 w-full">
              {loading
                ? Array.from({ length: getColumnsCount() }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="flex flex-col items-center flex-1">
                      <Skeleton className="w-32 h-32 rounded-full" />
                      <Skeleton className="mt-3 w-24 h-4" />
                      <Skeleton className="mt-2 w-28 h-4" />
                    </div>
                  ))
                : displayContributors.map((contributor) => {
                    const truncatedName = truncateString(contributor.login, 14);
                    const isTruncated = truncatedName !== contributor.login;

                    return (
                      <div
                        key={contributor.login}
                        className={`
                          flex flex-col items-center flex-1
                          transition-all duration-1000 ease-in-out
                          ${isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
                        `}
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
                          <p className="text-sm whitespace-nowrap text-gray-500">
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
            </div>
          </div>

          {/* Right Navigation */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90"
            onClick={() => {
              setIsTransitioning(true);
              setAutoScrollEnabled(false);
              setTimeout(() => {
                setRandomSeed(Math.floor(Math.random() * 1000));
                setIsTransitioning(false);
              }, 500);
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      ) : (
        // Normal Mode - Grid View
        <div className={`grid ${gridColumnsClass} gap-6 w-full items-start justify-items-start my-6 px-4`}>
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
            : displayContributors.map((contributor) => {
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
                      <p className="text-sm whitespace-nowrap text-gray-500">
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
        </div>
      )}

      {/* Pagination - Only show in normal mode */}
      {!isRandomMode && (
        <div className="flex justify-center w-full">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContributorsGrid;
