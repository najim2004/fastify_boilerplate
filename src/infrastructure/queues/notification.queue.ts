import { Queue } from 'bullmq';
import env from '../../app/env';

export const notificationQueue = new Queue('notification-queue', {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
  },
});

export default notificationQueue;
