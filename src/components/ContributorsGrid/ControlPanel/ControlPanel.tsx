/**
 * @file Contains the control panel for the contributors grid.
 */
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { FaEye, FaEyeSlash, FaMoon, FaSun } from "react-icons/fa";

/**
 * Represents the properties of the contributors control panel component.
 */
interface ContributorsControlPanelProps {
  /** Whether to hide organization members. */
  excludeOrgMembers: boolean;
  /** Whether to show last year's contributions. */
  displayLastYearContributions: boolean;
  /** Function to set whether to exclude organization members. */
  setExcludeOrgMembers: (value: boolean) => void;
  /** Function to set whether to display last year's contributions. */
  setDisplayLastYearContributions: (value: boolean) => void;
}

/**
 * Control panel for the contributors grid.
 * @param props - The component properties.
 */
export const ControlPanel = ({
  excludeOrgMembers,
  displayLastYearContributions,
  setExcludeOrgMembers,
  setDisplayLastYearContributions,
}: ContributorsControlPanelProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show skeleton while mounted is false.
  if (!mounted) {
    return (
      <div className="flex items-center mb-4 space-x-4">
        <Skeleton className="w-[119px] h-[22px]" />
        <Skeleton className="w-[95px] h-[22px]" />
        <Skeleton className="w-8 h-[22px]" />
      </div>
    );
  }

  return (
    <div className="flex items-center mb-4 space-x-4">
      {/* Org Members Hide/Show */}
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className={`cursor-pointer ${
                excludeOrgMembers
                  ? "bg-gray-500 text-white"
                  : "bg-livepeer text-white hover:bg-green-700"
              }`}
              onClick={() => setExcludeOrgMembers(!excludeOrgMembers)}
            >
              {excludeOrgMembers ? (
                <FaEyeSlash className="mr-2" />
              ) : (
                <FaEye className="mr-2" />
              )}{" "}
              Org Members
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {excludeOrgMembers ? "Show org members" : "Hide org members"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Last Year Contributions Hide/Show */}
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className={`cursor-pointer ${
                displayLastYearContributions
                  ? "bg-livepeer text-white hover:bg-green-700"
                  : "bg-gray-500 text-white"
              }`}
              onClick={() =>
                setDisplayLastYearContributions(!displayLastYearContributions)
              }
            >
              {displayLastYearContributions ? (
                <FaEye className="mr-2" />
              ) : (
                <FaEyeSlash className="mr-2" />
              )}{" "}
              Last Year
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {displayLastYearContributions
              ? "Hide last year contributors"
              : "Show last year contributors"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Theme Toggle */}
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className={`cursor-pointer py-1 ${
                isDarkMode
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">Change theme</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ControlPanel;
