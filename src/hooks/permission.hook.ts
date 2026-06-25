import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthUserPayload } from '../modules/auth/auth.types';

export const permissionHook = (requiredRole: string) => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const userPayload = request.user as AuthUserPayload;
    if (!userPayload || userPayload.type !== requiredRole) {
      reply.status(403).send({
        success: false,
        message: 'Forbidden: Insufficient Permissions',
      });
    }
  };
};

export default permissionHook;
