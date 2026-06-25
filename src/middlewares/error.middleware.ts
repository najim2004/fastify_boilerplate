import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export const errorMiddleware = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void => {
  request.log.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  reply.status(statusCode).send({
    success: false,
    statusCode,
    message,
    error: error.name,
  });
};

export default errorMiddleware;
