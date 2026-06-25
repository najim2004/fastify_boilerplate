import { FastifyReply, FastifyRequest } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import auth from '../infrastructure/auth/better-auth';
import { AuthUserPayload } from '../modules/auth/auth.types';

/**
 * authHook — standalone preHandler for session-based authentication.
 *
 * Use this when you need auth on individual routes or sub-groups without
 * using the `fastify.authenticate` decorator registered by `jwtPlugin`.
 * Both implementations share the same Better Auth session validation logic.
 *
 * Example:
 *   fastify.get('/route', { preHandler: [authHook] }, handler)
 */
export const authHook = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      reply.status(401).send({ success: false, message: 'Unauthorized' });
      return;
    }

    request.user = {
      userId: session.user.id,
      email: session.user.email,
      type: (session.user as { role?: string }).role ?? 'user',
    } satisfies AuthUserPayload;
  } catch {
    reply.status(401).send({ success: false, message: 'Unauthorized' });
  }
};

export default authHook;
