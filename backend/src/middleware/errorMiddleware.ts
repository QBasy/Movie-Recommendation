import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export async function errorMiddleware(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    console.error('Error:', error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    reply.status(statusCode).send({
        error: {
            message,
            statusCode
        }
    });
}