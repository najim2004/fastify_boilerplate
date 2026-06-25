import { FastifyInstance } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import auth from '../../infrastructure/auth/better-auth';
import authController from './auth.controller';

/**
 * authRoute — registers all /api/auth/* routes.
 *
 * Better Auth's built-in routes (sign-up, sign-in, sign-out, session,
 * email verification, 2FA, etc.) are served by the `/*` catch-all which
 * delegates directly to Better Auth's request handler.
 *
 * Custom routes are kept here only when we need to return data from our
 * own database that Better Auth doesn't manage (e.g. user profile fields).
 *
 * Better Auth route reference:
 *   POST /api/auth/sign-up/email        — register
 *   POST /api/auth/sign-in/email        — login
 *   POST /api/auth/sign-out             — logout
 *   GET  /api/auth/session              — current session
 *   GET  /api/auth/verify-email?token=  — email verification
 *   POST /api/auth/two-factor/enable    — enable 2FA
 *   POST /api/auth/two-factor/verify-totp — verify TOTP code
 */
export const authRoute = async (fastify: FastifyInstance): Promise<void> => {
  // ---------------------------------------------------------------------------
  // Custom routes — data from our DB beyond what Better Auth exposes
  // ---------------------------------------------------------------------------

  fastify.get(
    '/me',
    { preHandler: [fastify.authenticate] },
    authController.me.bind(authController),
  );

  // ---------------------------------------------------------------------------
  // Better Auth catch-all proxy
  // Forwards every unmatched /api/auth/* request to Better Auth's handler.
  // ---------------------------------------------------------------------------

  fastify.all('/*', async (request, reply) => {
    const url = new URL(
      request.url,
      `${request.protocol}://${request.headers.host}`,
    );

    const req = new Request(url.toString(), {
      method: request.method,
      headers: fromNodeHeaders(request.headers),
      body:
        request.method !== 'GET' && request.method !== 'HEAD'
          ? JSON.stringify(request.body)
          : undefined,
    });

    const response = await auth.handler(req);

    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));

    return reply.send(response.body ? await response.text() : null);
  });
};

export default authRoute;
