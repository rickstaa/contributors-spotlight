/**
 * @file Contains the application home page.
 */
import { ContributorsGrid } from "@/components/ContributorsGrid/ContributorsGrid";
import { ErrorDisplay } from "@/components/ErrorDisplay/ErrorDisplay";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { Header } from "@/components/Header";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Home page component.
 */
const Home = () => {
  return (
    <>
      <Header />
      <div className="flex justify-center mt-4">
        <ErrorBoundary
          fallback={<ErrorDisplay message="Failed to load contributors" />}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <ContributorsGrid />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default Home;
