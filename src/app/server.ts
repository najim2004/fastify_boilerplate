import { createApp } from './app';
import env from './env';
import prisma from '../infrastructure/prisma/client';
import bcrypt from 'bcryptjs';

export const startServer = async (): Promise<void> => {
  try {
    const app = await createApp();

    // Database check and seeding
    await prisma.$connect();
    console.log('📚 Database connected successfully for seeding check');

    const adminEmail = env.SYSTEM_EMAIL;
    const adminPassword = await bcrypt.hash(env.SYSTEM_PASSWORD, 10);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: env.SYSTEM_USERNAME,
        username: env.SYSTEM_USERNAME,
        password: adminPassword,
        type: 'admin',
      },
    });

    console.log(`👤 System Admin User verified/created (${adminEmail})`);

    const port = env.PORT;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server listening on ${env.APP_URL}`);
    console.log(`📝 Swagger Docs available at ${env.APP_URL}/api/docs`);
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

export default startServer;
