/**
 * @file Contains the contributors info widget page people can embed on their websites.
 */
import { ContributorsGrid } from "@/components/ContributorsGrid/ContributorsGrid";

/**
 * Contributors info widget page component.
 */
const ContributorsInfoWidget = () => {
  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <ContributorsGrid />
    </div>
  );
};

export default ContributorsInfoWidget;
