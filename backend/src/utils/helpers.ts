export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const asyncHandler = (fn: Function) => {
    return async (request: any, reply: any) => {
        try {
            await fn(request, reply);
        } catch (error) {
            reply.send(error);
        }
    };
};

export const sanitizeUser = (user: any) => {
    const { password, ...sanitized } = user.toObject ? user.toObject() : user;
    return sanitized;
};