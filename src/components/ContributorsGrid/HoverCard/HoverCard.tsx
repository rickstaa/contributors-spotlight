/**
 * @file Contains hover card for displaying GitHub contributor info.
 */
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

/**
 * Represents the properties of the contributor hover card component.
 */
interface ContributorHoverCardProps {
  /** The contributor info object. */
  contributor: Contributor;
  /** The child elements that trigger the hover card. */
  children: React.ReactNode;
}

/**
 * Component that displays a hover card with GitHub contributor information.
 * @param props - The component properties.
 */
export const HoverCard = ({
  contributor,
  children,
}: ContributorHoverCardProps) => {
  const { name, login, bio, company, location, twitter_username, blog_url } =
    contributor;
  const isEmployee = isOrgMember(contributor, ORG_NAME);

  return (
    <UIHoverCard openDelay={500} closeDelay={500}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent>
        <div className="p-1">
          <p className="font-bold">{capitalize(name || login)}</p>
          {bio && (
            <div className="flex items-center mt-2">
              <p className="text-sm text-gray-500 break-words">{bio}</p>
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
              <p className="text-sm text-gray-500">{location}</p>
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
                className={`text-sm ${
                  isEmployee ? "text-livepeer" : "text-gray-500"
                }`}
              >
                {isEmployee ? ORG_NAME : capitalize(cleanCompanyName(company))}
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </UIHoverCard>
  );
};

export default HoverCard;
