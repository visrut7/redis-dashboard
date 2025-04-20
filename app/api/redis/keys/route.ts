import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "../client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get("search") || "";
    const redis = getRedisClient();

    // Use SCAN instead of KEYS for better performance with large datasets
    let keys = [];
    let cursor = "0";

    // Only do one SCAN iteration to get a sample of keys
    const reply = await redis.scan(
      cursor,
      "MATCH",
      searchTerm ? `*${searchTerm}*` : "*",
      "COUNT",
      "5"
    );

    cursor = reply[0];
    keys = reply[1];

    // Limit to 10 keys for display
    const limitedKeys = keys.slice(0, 10);

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
