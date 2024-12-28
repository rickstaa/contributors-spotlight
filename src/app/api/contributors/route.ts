/**
 * @file Contains an API that returns information about organization contributors.
 */
import { NextResponse } from "next/server";
import { join } from "path";
import { promises as fs } from "fs";

/**
 * API route that returns information about organization contributors.
 * @returns JSON response with contributor information.
 */
export async function GET() {
  try {
    const CONTRIBUTORS_FILE =
      process.env.CONTRIBUTORS_FILE || "contributors.json";
    const filePath = join(process.cwd(), "public", CONTRIBUTORS_FILE);
    const fileContents = await fs.readFile(filePath, "utf8");
    const contributorsData = JSON.parse(fileContents);
    return NextResponse.json(contributorsData);
  } catch (error) {
    console.error("Error reading contributors file:", error);
    return NextResponse.json(
      { error: "Failed to read contributors file" },
      { status: 500 }
    );
  }
}
