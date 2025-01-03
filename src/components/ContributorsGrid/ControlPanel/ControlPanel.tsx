/**
 * @file Contains the control panel for the contributors grid.
 */
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center mb-4 space-x-4">
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
        Last Year Contributions
      </Badge>
      <Badge
        className={`cursor-pointer ${
          theme === "light"
            ? "bg-black text-white hover:bg-gray-800"
            : "bg-white text-black hover:bg-gray-200"
        }`}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? (
          <FaMoon className="mr-2" />
        ) : (
          <FaSun className="mr-2" />
        )}
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </Badge>
    </div>
  );
};

export default ControlPanel;
