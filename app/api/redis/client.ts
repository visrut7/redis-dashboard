import { Redis } from "ioredis";
import { cache } from "react";

// Create a cached Redis client to avoid creating multiple connections
export const getRedisClient = cache(() => {
  const redis = new Redis(process.env.REDIS_URL!, {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    family: 0,
  });
  // Add error handling
  redis.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  return redis;
});
