import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';

import prismaPlugin from '../plugins/prisma.plugin';
import redisPlugin from '../plugins/redis.plugin';
import jwtPlugin from '../plugins/jwt.plugin';
import swaggerPlugin from '../plugins/swagger.plugin';
import socketPlugin from '../plugins/socket.plugin';
import stripePlugin from '../plugins/stripe.plugin';

import registerRoutes from './register';
import errorMiddleware from '../middlewares/error.middleware';

export const createApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: true,
  });

  // Global Middlewares/Plugins
  await app.register(cors);
  await app.register(helmet, { contentSecurityPolicy: false }); // Disable CSP to support Swagger UI rendering
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await app.register(multipart, { attachFieldsToBody: true }); // Automatically parse form bodies

  // Register Custom Plugins
  await app.register(prismaPlugin);
  await app.register(redisPlugin);
  await app.register(jwtPlugin);
  await app.register(swaggerPlugin);
  await app.register(socketPlugin);
  await app.register(stripePlugin);

  // Register Routes
  await registerRoutes(app);

  // Global Error Handler
  app.setErrorHandler(errorMiddleware);

  return app;
};

export default createApp;
