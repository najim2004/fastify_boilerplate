import { Worker, Job } from 'bullmq';
import path from 'path';
import ejs from 'ejs';
import transporter from '../mail/transporter';
import env from '../../app/env';

interface EmailJobData {
  to: string;
  from?: string;
  subject: string;
  template: string;
  context: Record<string, string | number>;
}

export const emailWorker = new Worker<EmailJobData>(
  'mail-queue',
  async (job: Job<EmailJobData>) => {
    console.log(`✉️ Processing email job ${job.id} for ${job.data.to}`);
    try {
      const templateName = job.data.template || 'verify';
      const templatePath = path.join(
        __dirname,
        '../mail/templates',
        `${templateName}.ejs`,
      );

      // Render EJS HTML template
      const html = await ejs.renderFile(templatePath, job.data.context || {});

      // Send mail
      await transporter.sendMail({
        from: job.data.from || `${env.APP_NAME} <${env.MAIL_FROM_ADDRESS}>`,
        to: job.data.to,
        subject: job.data.subject,
        html,
      });

      console.log(`✅ Email sent successfully to ${job.data.to}`);
    } catch (error) {
      console.error(`❌ Failed to send email for job ${job.id}:`, error);
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

emailWorker.on('completed', (job) => {
  console.log(`🟢 Job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`🔴 Job ${job?.id} has failed with ${err.message}`);
});

export default emailWorker;
