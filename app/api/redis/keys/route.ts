import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "../client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    const redis = getRedisClient();

    // Use SCAN instead of KEYS for better performance with large datasets
    let allKeys: string[] = [];
    let cursor = "0";
    const pattern = searchTerm ? `*${searchTerm}*` : "*";
    const scanCount = limit; // Number of keys to attempt to retrieve in each scan

    // Continue scanning until we have enough keys or there are no more keys
    do {
      const reply = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        scanCount.toString()
      );

      cursor = reply[0];
      allKeys = [...allKeys, ...reply[1]];

      // If we have enough keys or reached the end of dataset (cursor = '0'), stop scanning
    } while (cursor !== "0" && allKeys.length < limit);

    // Limit to requested number of keys for display
    const limitedKeys = allKeys.slice(0, limit);

    return NextResponse.json({
      success: true,
      keys: limitedKeys,
    });
  } catch (error) {
    console.error("Error fetching Redis keys:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Redis keys" },
      { status: 500 }
    );
  }
}
