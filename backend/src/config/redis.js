import redis from 'redis';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
};

export const redisClient = redis.createClient(redisConfig);

await redisClient.connect();

console.log('connection is established');