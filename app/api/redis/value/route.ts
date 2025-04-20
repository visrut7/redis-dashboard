import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "../client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Key parameter is required" },
        { status: 400 }
      );
    }

    const redis = getRedisClient();

    // Check the type of the key to determine how to retrieve the value
    const type = await redis.type(key);
    let value;

    switch (type) {
      case "string":
        value = await redis.get(key);
        break;
      case "list":
        value = await redis.lrange(key, 0, -1);
        value = JSON.stringify(value);
        break;
      case "set":
        value = await redis.smembers(key);
        value = JSON.stringify(value);
        break;
      case "hash":
        value = await redis.hgetall(key);
        value = JSON.stringify(value);
        break;
      default:
        value = `Unsupported type: ${type}`;
    }

    return NextResponse.json({ success: true, value });
  } catch (error) {
    console.error("Error fetching Redis value:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Redis value" },
      { status: 500 }
    );
  }
}
