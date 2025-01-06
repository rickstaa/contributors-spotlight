/**
 * @file Contains API route that serves information about VIP contributors.
 */
import { VIP_CONTRIBUTORS_SOURCE } from "@/app/config";
import { isValidUrl } from "@/lib/utils";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { join } from "path";

/**
 * Fetches VIP contributors data from either a local file or an external URL.
 * @returns JSON object containing VIP contributor information.
 */
async function fetchVipContributorsData() {
  if (!VIP_CONTRIBUTORS_SOURCE) return [];

  // Fetch data from external URL or local file.
  if (isValidUrl(VIP_CONTRIBUTORS_SOURCE)) {
    const response = await fetch(VIP_CONTRIBUTORS_SOURCE, {
      next: {
        revalidate: 86400, // Revalidate every 24 hours.
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } else {
    const filePath = join(process.cwd(), "public", VIP_CONTRIBUTORS_SOURCE);
    const fileContents = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContents);
  }
}

/**
 * API route that returns information about VIP contributors.
 * @returns JSON response with VIP contributor information.
 */
export async function GET() {
  try {
    const vipContributorsData = await fetchVipContributorsData();
    const response = NextResponse.json(vipContributorsData);
    response.headers.set(
      "Cache-Control",
      "s-maxage=86400, stale-while-revalidate=3600"
    );
    return response;
  } catch (error) {
    console.error("Error fetching VIP contributors data:", error);
    return NextResponse.json(
      { error: "Failed to fetch VIP contributors data" },
      { status: 500 }
    );
  }
}
