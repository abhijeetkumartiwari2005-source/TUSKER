import { redisConfig } from '../config/redis.js';

const worker = new Worker('email', async (job) => { "email" }, { connection: redisConfig });