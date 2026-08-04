import { Worker } from 'bullmq';
import { getRedis } from '../config/redis';
import { processScanJob, ScanJobData } from './scanJob';
import logger from '../utils/logger';

export function startWorker(): Worker {
  const worker = new Worker<ScanJobData>(
    'domain-scans',
    async (job) => {
      logger.info(`Processing scan job ${job.id} for ${job.data.domain}`);
      await processScanJob(job.data);
    },
    {
      connection: getRedis(),
      concurrency: 3,
      limiter: { max: 10, duration: 60000 },
    }
  );

  worker.on('completed', (job) => logger.info(`Job ${job?.id} completed: ${job?.data.domain}`));
  worker.on('failed', (job, err) => logger.error(`Job ${job?.id} failed for ${job?.data?.domain}:`, err));

  logger.info('BullMQ worker started');
  return worker;
}
