/**
 * @file Contains the application home page.
 */
import { ContributorsGrid } from "@/components/ContributorsGrid/ContributorsGrid";
import { Suspense } from "react";

/**
 * Home page component.
 */
const Home = () => {
  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-6">
        🏆 Livepeer Contributors Spotlight
      </h1>
      <h5 className="text-center mt-2 text-gray-500">
        Celebrating the invaluable contributions of our open-source community!
      </h5>
      <div className="flex justify-center mt-6">
        <Suspense fallback={<div>Loading...</div>}>
          <ContributorsGrid />
        </Suspense>
      </div>
    </>
  );
};

export default Home;
