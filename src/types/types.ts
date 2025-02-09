/**
 * @file Contains types used throughout the application.
 */

/**
 * Represents a URL to a profile.
 */
interface ProfileUrl {
  /** Profile URL. */
  profile_url: string;
}

/**
 * Represents information about a GitHub contributor to the organization.
 */
export interface Contributor {
  /** The GitHub username of the contributor. */
  login: string;
  /** The full name of the contributor. */
  name: string;
  /** The URL of the contributor's avatar image. */
  avatar_url: string;
  /** The location of the contributor. */
  location: string;
  /** The company the contributor is associated with. */
  company: string;
  /** A short biography of the contributor. */
  bio: string;
  /** The URL of the contributor's blog or personal website. */
  blog_url: string;
  /** The Twitter username of the contributor. */
  twitter_username: string;
  /** Indicates whether the contributor is a member of the organization. */
  org_member: boolean;
  /** The total number of contributions made by the contributor. */
  contributions: number;
  /** The number of contributions made by the contributor in the last year. */
  yearly_contributions: number;
  /** Indicates whether the contributor is a VIP. */
  is_vip: boolean;
  /** Additional information about the VIP. */
  vip_info?: ProfileUrl;
}

/**
 * Represents information about a VIP contributor to the organization.
 */
export interface VipContributor extends ProfileUrl {
  /** The GitHub username of the contributor. */
  github: string;
}
