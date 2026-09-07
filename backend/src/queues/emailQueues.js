import { redisConfig } from './config/redis.js';

const emailQueue = new Queue('email', { connection: redisConfig });