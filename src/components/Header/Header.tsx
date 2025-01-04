/**
 * @file Contains the header component for the application.
 */
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ORG_NAME,
  ORG_WEBSITE,
  ORG_LOGO_LIGHT,
  ORG_LOGO_DARK,
} from "@/app/config";
import { capitalize } from "@/lib/utils";

/**
 * Header component for the application.
 */
export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Retrieve the logo content.
   */
  const getLogoContent = () => {
    if (!mounted) {
      return (
        <div className="w-[30px] h-[30px] mr-4 flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      );
    }

    if (imageError) return null;

    const logoSrc = theme === "dark" ? ORG_LOGO_LIGHT : ORG_LOGO_DARK;
    const logo = (
      <Image
        src={logoSrc}
        alt={`${capitalize(ORG_NAME)} logo`}
        width={30}
        height={30}
        className="inline-block"
        onError={() => setImageError(true)}
      />
    );

    return (
      <div className="w-[30px] h-[30px] mr-4 flex items-center justify-center">
        {ORG_WEBSITE ? (
          <a href={ORG_WEBSITE} target="_blank" rel="noopener noreferrer">
            {logo}
          </a>
        ) : (
          logo
        )}
      </div>
    );
  };

  const logoContent = getLogoContent();

  return (
    <div className="flex flex-col items-center mt-6 px-4">
      <div className="flex items-center justify-center">
        {logoContent}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Contributors Spotlight
        </h1>
      </div>
      <h5 className="text-center mt-4 text-sm sm:text-base md:text-lg text-gray-500">
        Celebrating the invaluable contributions of our open-source community!
      </h5>
    </div>
  );
};

export default Header;
