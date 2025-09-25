export type ErrorCode =
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UNPROCESSABLE"
    | "TOO_MANY_REQUESTS"
    | "INTERNAL"
    | "METHOD_NOT_ALLOWED";

export class HttpError extends Error {
    readonly status: number;
    readonly code: ErrorCode;
    readonly details?: unknown;

    constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequestError extends HttpError {
    constructor(message = "Bad request", details?: unknown) {
        super(400, "BAD_REQUEST", message, details);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = "Unauthorized", details?: unknown) {
        super(401, "UNAUTHORIZED", message, details);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = "Forbidden", details?: unknown) {
        super(403, "FORBIDDEN", message, details);
    }
}

export class NotFoundError extends HttpError {
    constructor(resource = "Resource", details?: unknown) {
        super(404, "NOT_FOUND", `${resource} not found`, details);
    }
}

export class ConflictError extends HttpError {
    constructor(message = "Conflict", details?: unknown) {
        super(409, "CONFLICT", message, details);
    }
}

export class InternalError extends HttpError {
    constructor(message = "Internal server error", details?: unknown) {
        super(500, "INTERNAL", message, details);
    }
}

export class MethodNotAllowedError extends HttpError {
    constructor(message = "Method not allowed", details?: unknown) {
        super(405, "METHOD_NOT_ALLOWED", message, details);
    }
}
