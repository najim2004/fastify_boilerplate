import { FastifyInstance } from 'fastify';

export const chatsRoute = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/', async (request, reply) => {
    reply.send({ success: true, message: 'Chats module skeleton' });
  });
};

export default chatsRoute;
