import { Queue } from 'bullmq';
import env from '../../app/env';

export const emailQueue = new Queue('mail-queue', {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
  },
});

export default emailQueue;
