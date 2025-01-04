/**
 * @file Contains API route that serves information about organization contributors.
 */
import { CONTRIBUTORS_SOURCE } from "@/app/config";
import { isValidUrl } from "@/lib/utils";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { join } from "path";

/**
 * Fetches contributors data from either a local file or an external URL.
 * @returns JSON object containing contributor information.
 */
async function fetchContributorsData() {
  if (!CONTRIBUTORS_SOURCE) {
    throw new Error("CONTRIBUTORS_SOURCE environment variable is not defined");
  }

  // Fetch data from external URL or local file.
  if (isValidUrl(CONTRIBUTORS_SOURCE)) {
    const response = await fetch(CONTRIBUTORS_SOURCE, {
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
    const filePath = join(process.cwd(), "public", CONTRIBUTORS_SOURCE);
    const fileContents = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContents);
  }
}

/**
 * API route that returns information about organization contributors.
 * @returns JSON response with contributor information.
 */
export async function GET() {
  try {
    const contributorsData = await fetchContributorsData();
    const response = NextResponse.json(contributorsData);
    response.headers.set(
      "Cache-Control",
      "s-maxage=86400, stale-while-revalidate=3600"
    );
    return response;
  } catch (error) {
    console.error("Error fetching contributors data:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributors data" },
      { status: 500 }
    );
  }
}
