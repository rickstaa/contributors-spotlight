/**
 * @file Contains the contributors carousel component.
 */
"use client";
import { useEffect, useState, useRef } from "react";
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
import { ContributorCard } from "./ContributorCard";
import { Contributor } from "@/types";

// Constants
const CAROUSEL_ITEMS_PER_ROW = 4;
const SLIDE_INTERVAL = 5000; // 5 seconds

/**
 * Component that displays a horizontal carousel of contributors.
 * @param props - Component properties.
 */
export const ContributorsCarousel = ({ contributors = [], loading = false }) => {
  const [shuffledContributors, setShuffledContributors] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);

  // Shuffle contributors on mount
  useEffect(() => {
    if (contributors.length > 0) {
      const shuffled = [...contributors].sort(() => 0.5 - Math.random());
      setShuffledContributors(shuffled);
    }
  }, [contributors]);

  // Auto slide effect
  useEffect(() => {
    if (shuffledContributors.length <= CAROUSEL_ITEMS_PER_ROW) return;
    
    const interval = setInterval(() => {
      setCarouselIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        return nextIndex >= Math.ceil(shuffledContributors.length / CAROUSEL_ITEMS_PER_ROW) ? 0 : nextIndex;
      });
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [shuffledContributors]);

  // Get current items to display
  const visibleContributors = shuffledContributors.slice(
    carouselIndex * CAROUSEL_ITEMS_PER_ROW,
    (carouselIndex + 1) * CAROUSEL_ITEMS_PER_ROW
  );

  // Fill remaining slots with contributors from the beginning if needed
  const displayContributors = [...visibleContributors];
  if (displayContributors.length < CAROUSEL_ITEMS_PER_ROW && shuffledContributors.length > CAROUSEL_ITEMS_PER_ROW) {
    const remainingCount = CAROUSEL_ITEMS_PER_ROW - displayContributors.length;
    const fillerContributors = shuffledContributors.slice(0, remainingCount);
    displayContributors.push(...fillerContributors);
  }

  return (
    <div className="w-full overflow-hidden" ref={carouselRef}>
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(0)` }}
      >
        <div className="grid grid-cols-4 gap-6 w-full items-start justify-items-start my-6 px-4">
          {loading
            ? Array.from({ length: CAROUSEL_ITEMS_PER_ROW }).map((_, index) => (
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
                    key={`carousel-${contributor.login}-${Math.random()}`}
                    className="flex flex-col items-center w-full min-w-[125px]"
                  >
                    <ContributorCard
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
                          contributor.yearly_contributions || contributor.contributions
                        )}
                      </p>
                    </a>
                  </div>
                );
              })}
        </div>
      </div>
      
      {/* Carousel Indicator Dots */}
      {shuffledContributors.length > CAROUSEL_ITEMS_PER_ROW && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(shuffledContributors.length / CAROUSEL_ITEMS_PER_ROW) }).map((_, index) => (
            <button
              key={`indicator-${index}`}
              className={`h-2 w-2 rounded-full ${
                index === carouselIndex ? "bg-livepeer" : "bg-gray-300"
              }`}
              onClick={() => setCarouselIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContributorsCarousel;