import { NextResponse } from "next/server";
import { getRedisClient } from "../client";

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();

    if (!key || !value) {
      return NextResponse.json(
        { success: false, error: "Key and value are required" },
        { status: 400 }
      );
    }

    const redis = getRedisClient();
    await redis.set(key, value);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting key-value pair:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set key-value pair" },
      { status: 500 }
    );
  }
}
