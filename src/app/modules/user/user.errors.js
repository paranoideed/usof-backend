export class InternalError extends Error {
    constructor(msg = 'Internal error', cause = null) {
        super(msg);
        this.code = 'INTERNAL_ERROR';
        this.status = 500;
        if (cause) this.cause = cause;
    }
}

export class UserNotFoundError extends Error {
    constructor(msg = 'User not found') {
        super(msg);
        this.code = 'USER_NOT_FOUND';
        this.status = 404;
    }
}

export class UserAlreadyExistsError extends Error {
    constructor(msg = 'User already exists') {
        super(msg);
        this.code = 'USER_ALREADY_EXISTS';
        this.status = 409;
    }
}

export class InvalidTokenError extends Error {
    constructor(msg = 'Invalid token') {
        super(msg);
        this.code = 'INVALID_TOKEN';
        this.status = 401;
    }
}

export class InvalidPasswordError extends Error {
    constructor(msg = 'Invalid password') {
        super(msg);
        this.code = 'INVALID_PASSWORD';
        this.status = 401;
    }
}