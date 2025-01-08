/**
 * @file Contains contributor card component for displaying GitHub contributor info.
 * Uses a hover card for desktop and a popover for mobile devices.
 */
"use client";
import { useEffect, useState } from "react";
import {
  HoverCard as UIHoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  capitalize,
  cleanCompanyName,
  ensureHttps,
  isOrgMember,
} from "@/lib/utils";
import { Contributor } from "@/types";
import { Briefcase, Link, MapPin } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { ORG_NAME } from "@/app/config";
import { FaGithub } from "react-icons/fa";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { VIP_LABEL } from "@/app/config";
import { VipIcon } from "./VipIcon";

/**
 * Represents the properties of the contributor card component.
 */
interface ContributorCardProps {
  /** The contributor info object. */
  contributor: Contributor;
  /** The child elements that trigger the card. */
  children: React.ReactNode;
}

/**
 * Component that displays a card with GitHub contributor information.
 * Uses a hover card for desktop and a popover for mobile devices.
 * @param props - The component properties.
 */
export const ContributorCard = ({
  contributor,
  children,
}: ContributorCardProps) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is a mobile device.
  useEffect(() => {
    const handleTouchStart = () => {
      setIsMobile(true);
      window.removeEventListener("touchstart", handleTouchStart);
    };

    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  const { name, login, bio, company, location, twitter_username, blog_url } =
    contributor;
  const isEmployee = isOrgMember(contributor, ORG_NAME);
  const VipLabel = <p className="text-yellow-600">{capitalize(VIP_LABEL)}</p>;

  const content = (
    <div className="p-1">
      <p className="font-bold">{capitalize(name || login)}</p>
      {bio && (
        <div className="flex items-center mt-2">
          <p className="text-sm text-gray-500 break-words line-clamp-5">
            {bio}
          </p>
        </div>
      )}
      {contributor.is_vip && (
        <div className="flex items-center mt-2">
          <VipIcon className="w-4 h-4 mr-2 text-yellow-600" />
          {contributor.vip_info?.profile_url ? (
            <a
              href={contributor.vip_info.profile_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {VipLabel}
            </a>
          ) : (
            VipLabel
          )}
        </div>
      )}
      <div className="flex items-center mt-2">
        <FaGithub className="w-4 h-4 mr-2 text-gray-500" />
        <a
          href={`https://github.com/${login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500"
        >
          {login}
        </a>
      </div>
      {blog_url && (
        <div className="flex items-center mt-2">
          <Link className="w-4 h-4 mr-2 text-gray-500" />
          <a
            href={ensureHttps(blog_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 truncate max-w-xs"
            title={blog_url}
          >
            {blog_url}
          </a>
        </div>
      )}
      {twitter_username && (
        <div className="flex items-center mt-2">
          <FaXTwitter className="w-4 h-4 mr-2 text-gray-500" />
          <a
            href={`https://twitter.com/${twitter_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            @{twitter_username}
          </a>
        </div>
      )}
      {location && (
        <div className="flex items-center mt-2">
          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
          <p className="text-sm text-gray-500 break-words line-clamp-2">
            {location}
          </p>
        </div>
      )}
      {(company || isEmployee) && (
        <div className="flex items-center mt-2">
          <Briefcase
            className={`w-4 h-4 mr-2 ${
              isEmployee ? "text-livepeer" : "text-gray-500"
            }`}
          />
          <p
            className={`text-sm break-words line-clamp-2 ${
              isEmployee ? "text-livepeer" : "text-gray-500"
            }`}
          >
            {isEmployee
              ? capitalize(ORG_NAME)
              : capitalize(cleanCompanyName(company))}
          </p>
        </div>
      )}
    </div>
  );

  return isMobile ? (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent>{content}</PopoverContent>
    </Popover>
  ) : (
    <UIHoverCard openDelay={500} closeDelay={500}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent>{content}</HoverCardContent>
    </UIHoverCard>
  );
};

export default ContributorCard;
