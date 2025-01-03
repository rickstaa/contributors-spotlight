/**
 * @file Contains utility functions used throughout the application.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Contributor } from "@/types";

/**
 * Merge class names with Tailwind CSS.
 * @param inputs  - The class names to merge.
 * @returns The merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a string is a valid URL.
 * @param url - The URL to check.
 * @returns Whether the URL is valid.
 */
export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Ensures the URL starts with "https://".
 * @param url - The URL to check.
 * @returns The URL with "https://" prepended if it was missing.
 */
export function ensureHttps(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Capitalizes the first letter of the string and makes the rest lowercase.
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Removes spaces and "@" prefix from the company name.
 * @param companyName - The company name to clean.
 * @returns The cleaned company name.
 */
export function cleanCompanyName(companyName: string): string {
  if (!companyName) return "";
  return companyName.replace(/[@\s]/g, "");
}

/**
 * Check if a contributor is an employee of the organization.
 * @param contributor - The contributor to check.
 * @param orgName - The name of the organization to check against.
 * @returns Whether the contributor is an employee of the organization.
 */
export const isOrgMember = (
  contributor: Contributor,
  orgName: string
): boolean => {
  if (!contributor || !orgName) return false;
  return (
    contributor.org_member ||
    cleanCompanyName(contributor.company || "").toLowerCase() ===
      orgName.toLowerCase()
  );
};

/**
 * Formats a number into a compact representation (e.g. 1.5K, 2.3M).
 * @param num - The number to format.
 * @returns The compact number representation.
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

/**
 * Truncates a string to a specified length.
 * @param str - The string to truncate.
 * @param maxLength - The maximum length of the string.
 * @returns The truncated string
 */
export const truncateString = (str: string, maxLength: number): string => {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};
