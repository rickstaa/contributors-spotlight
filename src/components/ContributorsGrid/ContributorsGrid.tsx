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
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [randomSeed, setRandomSeed] = useState(() => Math.floor(Math.random() * 1000));
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get scroll speed and seed from URL params
  const { scrollSpeed, randomSpeed } = useMemo(() => {
    const speedParam = searchParams.get('scrollSpeed');
    const randomParam = searchParams.get('randomSpeed');
    return {
      scrollSpeed: SCROLL_SPEEDS[speedParam as keyof typeof SCROLL_SPEEDS] || SCROLL_SPEEDS.slow,
      randomSpeed: RANDOM_INTERVALS[randomParam as keyof typeof RANDOM_INTERVALS] || RANDOM_INTERVALS.medium,
    };
  }, [searchParams]);

  // Automatic randomization effect with smooth transition
  useEffect(() => {
    if (!autoScrollEnabled) return;

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
  }, [autoScrollEnabled, randomSpeed]);

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
      setItemsPerPage(getItemsPerPage());
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

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

  // Calculate items per page based on screen size
  const itemsPerRow = useMemo(() => {
    if (typeof window === "undefined") return 4;
    const width = window.innerWidth;
    if (width >= 1024) return 4; // Desktop: 4 items
    if (width >= 768) return 3;  // Tablet: 3 items
    if (width >= 640) return 2;  // Small tablet: 2 items
    return 1;                    // Mobile: 1 item
  }, []);

  // Define seededShuffle function
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

  // Create a duplicated array for infinite scroll with better randomization
  const infiniteContributors = useMemo(() => {
    const filtered = filteredContributors
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

    // Create three differently shuffled copies for variety
    const firstShuffle = seededShuffle(filtered, randomSeed);
    const secondShuffle = seededShuffle(filtered, randomSeed + 1);
    const thirdShuffle = seededShuffle(filtered, randomSeed + 2);

    return [...firstShuffle, ...secondShuffle, ...thirdShuffle];
  }, [filteredContributors, excludeOrgMembers, displayLastYearContributions, randomSeed]);

  // Handle page changes for pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setAutoScrollEnabled(false);
    setScrollPosition((page - 1) * 4);
    // Generate new random seed for the page
    setRandomSeed(Math.floor(Math.random() * 1000));
  }, []);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
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
    }
    if (searchParams.get('scrollSpeed')) {
      params.set('scrollSpeed', searchParams.get('scrollSpeed')!);
    }
    if (searchParams.get('randomSpeed')) {
      params.set('randomSpeed', searchParams.get('randomSpeed')!);
    }
    if (!autoScrollEnabled) {
      params.set('seed', randomSeed.toString());
    }
    router.replace(`?${params.toString()}`);
  }, [excludeOrgMembers, displayLastYearContributions, currentPage, randomSeed, autoScrollEnabled]);

  return (
    <div className="flex flex-col items-center">
      <ControlPanel
        excludeOrgMembers={excludeOrgMembers}
        displayLastYearContributions={displayLastYearContributions}
        setExcludeOrgMembers={setExcludeOrgMembers}
        setDisplayLastYearContributions={setDisplayLastYearContributions}
      />

      {/* Contributors Grid with Navigation */}
      <div className="relative w-full my-6 px-16 overflow-hidden">
        {/* Left Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90"
          onClick={() => {
            setIsTransitioning(true);
            setTimeout(() => {
              const newPage = currentPage > 1 ? currentPage - 1 : Math.ceil(infiniteContributors.length / 12);
              handlePageChange(newPage);
              setIsTransitioning(false);
            }, 500);
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Contributors Grid */}
        <div 
          className={`
            flex transition-all duration-1000 ease-in-out
            ${isTransitioning ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
          `}
          style={{
            transform: `translateX(${-(scrollPosition % 1) * 25}%)`,
          }}
          onMouseEnter={() => setAutoScrollEnabled(false)}
          onMouseLeave={() => {
            setAutoScrollEnabled(true);
            setIsTransitioning(true);
            setTimeout(() => {
              setRandomSeed(Math.floor(Math.random() * 1000));
              setIsTransitioning(false);
            }, 500);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="flex flex-col items-center">
                    <Skeleton className="w-32 h-32 rounded-full" />
                    <Skeleton className="mt-3 w-24 h-4" />
                    <Skeleton className="mt-2 w-28 h-4" />
                  </div>
                ))
              : infiniteContributors
                  .slice(scrollPosition, scrollPosition + 4)
                  .map((contributor) => {
                    const truncatedName = truncateString(contributor.login, 14);
                    const isTruncated = truncatedName !== contributor.login;

                    return (
                      <div
                        key={contributor.login}
                        className={`
                          flex flex-col items-center w-full min-w-[125px]
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
          </div>
        </div>

        {/* Right Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90"
          onClick={() => {
            setIsTransitioning(true);
            setTimeout(() => {
              const newPage = currentPage < Math.ceil(infiniteContributors.length / 12) ? currentPage + 1 : 1;
              handlePageChange(newPage);
              setIsTransitioning(false);
            }, 500);
          }}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Pagination */}
      <div className="flex justify-center w-full">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(infiniteContributors.length / 12)}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContributorsGrid;
