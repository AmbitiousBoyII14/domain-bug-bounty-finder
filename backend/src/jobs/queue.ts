import { Queue } from 'bullmq';
import { getRedis } from '../config/redis';

export const scanQueue = new Queue('domain-scans', {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 3600 * 24 },
    removeOnFail: { age: 3600 * 24 * 7 },
  },
});

export const notificationQueue = new Queue('notifications', {
  connection: getRedis(),
  defaultJobOptions: { attempts: 2, removeOnComplete: { age: 3600 } },
});
