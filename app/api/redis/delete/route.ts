import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "../client";

export async function DELETE(request: NextRequest) {
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
    const result = await redis.del(key);

    if (result === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Key not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Key '${key}' successfully deleted`,
    });
  } catch (error) {
    console.error("Error deleting Redis key:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete Redis key" },
      { status: 500 }
    );
  }
}
