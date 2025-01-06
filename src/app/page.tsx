/**
 * @file Contains the application home page.
 */
import { ContributorsGrid } from "@/components/ContributorsGrid/ContributorsGrid";
import { ErrorDisplay } from "@/components/ErrorDisplay/ErrorDisplay";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { Header } from "@/components/Header";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Footer } from "@/components/Footer";
import { GithubCorner } from "@/components/GithubCorner";

/**
 * Home page component.
 */
const Home = () => {
  return (
    <>
      <GithubCorner href="https://github.com/rickstaa/contributors-spotlight" />
      <Header />
      <div className="flex justify-center">
        <ErrorBoundary
          fallback={<ErrorDisplay message="Failed to load contributors" />}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <ContributorsGrid />
          </Suspense>
        </ErrorBoundary>
      </div>
      <Footer />
    </>
  );
};

export default Home;
