import { Worker, Job } from 'bullmq';
import env from '../../app/env';

interface PaymentJobData {
  userId: string;
  amount: number;
  currency: string;
  transactionId: string;
}

export const paymentWorker = new Worker<PaymentJobData>(
  'payment-queue',
  async (job: Job<PaymentJobData>) => {
    console.log(
      `💳 Processing payment job ${job.id} for user ${job.data.userId}`,
    );
    try {
      const { userId, amount, currency, transactionId } = job.data;
      // Here you would integrate with Stripe or another processor
      console.log(
        `✅ Payment processed: ${amount} ${currency} for user ${userId} on TX ${transactionId}`,
      );
    } catch (error) {
      console.error(`❌ Failed to process payment for job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
    },
  },
);

export default paymentWorker;
