export class CategoryAlreadyExist extends Error {
    constructor(msg = 'Category with this title already exists') {
        super(msg);
        this.code = 'CATEGORY_ALREADY_EXISTS';
        this.status = 409;
    }
}

export class CategoryNotFoundError extends Error {
    constructor(msg = 'Category not found') {
        super(msg);
        this.code = 'CATEGORY_NOT_FOUND';
        this.status = 404;
    }
}