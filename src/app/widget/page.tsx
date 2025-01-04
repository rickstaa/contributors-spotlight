/**
 * @file Contains the contributors info widget page people can embed on their websites.
 */
import { ContributorsGrid } from "@/components/ContributorsGrid/ContributorsGrid";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Contributors info widget page component.
 */
const ContributorsInfoWidget = () => {
  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<LoadingSpinner />}>
          <ContributorsGrid />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default ContributorsInfoWidget;
