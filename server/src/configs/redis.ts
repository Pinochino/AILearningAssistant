import { createClient, RedisClientType } from "redis";

let pubClient: RedisClientType;
let subClient: RedisClientType;
let redisClient: RedisClientType;

export async function createRedisClients(url: string) {
    pubClient = createClient({ url });
    await pubClient.connect();
    subClient = pubClient.duplicate();
    await subClient.connect();

    // Create a unified client for general operations
    redisClient = createClient({ url });
    await redisClient.connect();

    console.log("✅ Redis clients ready");
    return { pubClient, subClient };
}

// Export the unified client for use in services
export { redisClient as REDIS_CLIENT };
