import { FastifyReply, FastifyRequest } from 'fastify';
import userService from './user.service';
import { AuthUserPayload } from '../auth/auth.types';

export class UserController {
  async getUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userPayload = request.user as AuthUserPayload;
      const user = await userService.getUser(userPayload.userId);
      if (!user) {
        reply.status(404).send({ success: false, message: 'User not found' });
        return;
      }
      reply.send({ success: true, user });
    } catch (error) {
      const err = error as Error;
      reply.status(400).send({ success: false, message: err.message });
    }
  }

  async updateUser(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const userPayload = request.user as AuthUserPayload;
      const body = request.body as Record<string, string>;
      const updatedUser = await userService.updateUser(
        userPayload.userId,
        body,
      );
      reply.send({ success: true, user: updatedUser });
    } catch (error) {
      const err = error as Error;
      reply.status(400).send({ success: false, message: err.message });
    }
  }
}

export const userController = new UserController();
export default userController;
