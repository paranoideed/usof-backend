export class PostCategoriesNumberError extends Error {
    constructor(msg = 'Post must have between 1 and 5 categories') {
        super(msg);
        this.code = 'POST_CATEGORIES_NUMBER_ERROR';
        this.status = 400;
    }
}

export class PostNotFoundError extends Error {
    constructor(msg = 'Post not found') {
        super(msg);
        this.code = 'POST_NOT_FOUND';
        this.status = 404;
    }
}