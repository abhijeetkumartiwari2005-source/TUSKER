import { Queue } from 'bullmq';
import { bullmqConnection } from '../config/redis.js';

const emailQueue = new Queue('email', { connection: bullmqConnection });

export default emailQueue;