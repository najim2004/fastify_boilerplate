import { FastifyInstance } from 'fastify';

export const adminRoute = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/', async (request, reply) => {
    reply.send({ success: true, message: 'Admin module skeleton' });
  });
};

export default adminRoute;
