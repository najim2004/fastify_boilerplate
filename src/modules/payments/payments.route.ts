import { FastifyInstance } from 'fastify';

export const paymentsRoute = async (
  fastify: FastifyInstance,
): Promise<void> => {
  fastify.get('/', async (request, reply) => {
    reply.send({ success: true, message: 'Payments module skeleton' });
  });
};

export default paymentsRoute;
