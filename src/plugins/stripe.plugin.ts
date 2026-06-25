import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import {
  stripe,
  stripePaymentService,
} from '../infrastructure/payments/stripe';
import Stripe from 'stripe';

declare module 'fastify' {
  interface FastifyInstance {
    stripe: Stripe;
    stripePaymentService: typeof stripePaymentService;
  }
}

const stripePlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.decorate('stripe', stripe);
  fastify.decorate('stripePaymentService', stripePaymentService);
});

export default stripePlugin;
