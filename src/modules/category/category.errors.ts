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
