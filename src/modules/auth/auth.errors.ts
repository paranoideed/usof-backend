export class UserNotFoundError extends Error {
    code: string;
    status: number;

    constructor(msg = 'User not found') {
        super(msg);
        this.code = 'USER_NOT_FOUND';
        this.status = 404;

        Object.setPrototypeOf(this, UserNotFoundError.prototype);
    }
}

export class UserAlreadyExistsError extends Error {
    code: string;
    status: number;

    constructor(msg = 'User already exists') {
        super(msg);
        this.code = 'USER_ALREADY_EXISTS';
        this.status = 409;

        Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
    }
}