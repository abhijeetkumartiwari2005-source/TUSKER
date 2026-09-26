import redis from 'redis';
import IORedis from 'ioredis';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
   maxRetriesPerRequest: null
};
export const bullmqConnection = new IORedis(redisConfig.port, redisConfig.host, {
  maxRetriesPerRequest: null
});

export const redisClient = redis.createClient(redisConfig);

await redisClient.connect();

console.log('connection is established');