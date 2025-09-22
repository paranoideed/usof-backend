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

export class InvalidCredentialsError extends Error {
    code: string;
    status: number;

    constructor(msg = 'Invalid credentials') {
        super(msg);
        this.code = 'INVALID_CREDENTIALS';
        this.status = 401;

        Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
    }
}