export class InitiatorNotFound extends Error {
    code: string;
    status: number;

    constructor(msg = 'Initiator not found') {
        super(msg);
        this.code = 'INITIATOR_NOT_FOUND';
        this.status = 401;

        Object.setPrototypeOf(this, InitiatorNotFound.prototype);
    }
}

export class PermissionDeniedError extends Error {
    code: string;
    status: number;

    constructor(msg = 'Permission denied') {
        super(msg);
        this.code = 'PERMISSION_DENIED';
        this.status = 403;

        Object.setPrototypeOf(this, PermissionDeniedError.prototype);
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

export class CategoryNotFoundError extends Error {
    code: string;
    status: number;

    constructor(msg = 'Category not found') {
        super(msg);
        this.code = 'CATEGORY_NOT_FOUND';
        this.status = 404;

        Object.setPrototypeOf(this, CategoryNotFoundError.prototype);
    }
}

export class CategoryAlreadyExist extends Error {
    code: string;
    status: number;

    constructor(msg = 'Category with this title already exists') {
        super(msg);
        this.code = 'CATEGORY_ALREADY_EXISTS';
        this.status = 409;

        Object.setPrototypeOf(this, CategoryAlreadyExist.prototype);
    }
}

export class PostNotFoundError extends Error {
    code: string;
    status: number;

    constructor(msg = 'Post not found') {
        super(msg);
        this.code = 'POST_NOT_FOUND';
        this.status = 404;

        Object.setPrototypeOf(this, PostNotFoundError.prototype);
    }
}

export class ParentCommentNotFoundError extends Error {
    code: string;
    status: number;

    constructor(msg = 'Parent comment not found') {
        super(msg);
        this.code = 'PARENT_COMMENT_NOT_FOUND';
        this.status = 404;

        Object.setPrototypeOf(this, ParentCommentNotFoundError.prototype);
    }
}

export class CommentNotFoundError extends Error {
    code: string;
    status: number;

    constructor(msg = 'Comment not found') {
        super(msg);
        this.code = 'COMMENT_NOT_FOUND';
        this.status = 404;

        Object.setPrototypeOf(this, CommentNotFoundError.prototype);
    }
}

