import { FastifyReply, FastifyRequest } from 'fastify';
import authService from './auth.service';
import { AuthUserPayload, AuthResponse } from './auth.types';

export class AuthController {
  /**
   * GET /me
   * Returns the current user's profile from our database.
   * The session is already validated by the `authenticate` preHandler.
   */
  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { userId } = request.user as AuthUserPayload;
      const response: AuthResponse = await authService.me(userId);
      reply.send(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error';
      reply.status(404).send({ success: false, message });
    }
  }
}

export const authController = new AuthController();
export default authController;
