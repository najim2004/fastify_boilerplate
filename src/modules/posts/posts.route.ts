import { FastifyInstance } from 'fastify';

export const postsRoute = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/', async (request, reply) => {
    reply.send({ success: true, message: 'Posts module skeleton' });
  });
};

export default postsRoute;
