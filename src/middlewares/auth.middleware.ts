import { FastifyReply, FastifyRequest } from 'fastify';

export const authMiddleware = async (
  _request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> => {
  // Placeholder for express-style middleware compatibility
};

export default authMiddleware;
