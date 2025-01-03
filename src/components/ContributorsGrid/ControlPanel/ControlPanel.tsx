/**
 * @file Contains the control panel for the contributors grid.
 */
import { Badge } from "@/components/ui/badge";
import { FaEye, FaEyeSlash } from "react-icons/fa";

/**
 * Represents the properties of the contributors control panel component.
 */
interface ContributorsControlPanelProps {
  /** Whether to hide organization members. */
  hideOrgMembers: boolean;
  /** Whether to show yearly contributions. */
  showYearlyContributions: boolean;
  /** Function to set whether to hide organization members. */
  setHideOrgMembers: (value: boolean) => void;
  /** Function to set whether to show yearly contributions */
  setShowYearlyContributions: (value: boolean) => void;
}

/**
 * Control panel for the contributors grid.
 * @param props - The component properties.
 */
export const ControlPanel = ({
  hideOrgMembers,
  showYearlyContributions,
  setHideOrgMembers,
  setShowYearlyContributions,
}: ContributorsControlPanelProps) => {
  return (
    <div className="flex items-center mb-4 space-x-4">
      <Badge
        className={`cursor-pointer ${
          hideOrgMembers
            ? "bg-gray-500 text-white"
            : "bg-livepeer text-white hover:bg-green-700"
        }`}
        onClick={() => setHideOrgMembers(!hideOrgMembers)}
      >
        {hideOrgMembers ? (
          <FaEyeSlash className="mr-2" />
        ) : (
          <FaEye className="mr-2" />
        )}{" "}
        Org Members
      </Badge>
      <Badge
        className={`cursor-pointer ${
          showYearlyContributions
            ? "bg-livepeer text-white hover:bg-green-700"
            : "bg-gray-500 text-white"
        }`}
        onClick={() => setShowYearlyContributions(!showYearlyContributions)}
      >
        {showYearlyContributions ? (
          <FaEyeSlash className="mr-2" />
        ) : (
          <FaEye className="mr-2" />
        )}{" "}
        Yearly Contributions
      </Badge>
    </div>
  );
};

export default ControlPanel;
