import { FastifyInstance } from 'fastify';

export const notificationsRoute = async (
  fastify: FastifyInstance,
): Promise<void> => {
  fastify.get('/', async (request, reply) => {
    reply.send({ success: true, message: 'Notifications module skeleton' });
  });
};

export default notificationsRoute;
