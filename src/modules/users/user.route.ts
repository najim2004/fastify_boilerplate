import { FastifyInstance } from 'fastify';
import userController from './user.controller';
import { updateUserSchema } from './user.schema';

export const userRoute = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    userController.getUser,
  );
  fastify.patch(
    '/',
    { preHandler: [fastify.authenticate], schema: { body: updateUserSchema } },
    userController.updateUser,
  );
};

export default userRoute;
