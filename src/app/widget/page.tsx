/**
 * @file Contains the contributors info widget page people can embed on their websites.
 */
import { ContributorsGrid } from "@/components/ContributorsGrid/ContributorsGrid";
import { Suspense } from "react";

/**
 * Contributors info widget page component.
 */
const ContributorsInfoWidget = () => {
  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <ContributorsGrid />
      </Suspense>
    </div>
  );
};

export default ContributorsInfoWidget;
