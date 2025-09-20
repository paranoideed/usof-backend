import {Database} from "../../../database/database.js";
import { v4 as uuid } from 'uuid';
import {PostCategoriesNumberError, PostNotFoundError} from "./post.errors.js";

const PostStatusActive = 'active';
const PostStatusHidden = 'hidden';
const PostStatusDeleted = 'deleted';

export class PostDomain {
    constructor(config) {
        this.db = new Database(config);
        this.categories = new Database(config);
    }

    async createPost(initiatorID, title, content, categories = []) {
        return this.db.transaction(async (trx) => {
            const postID = uuid()

            const newPost = {
                id:         postID,
                userID:     initiatorID,
                title:      title,
                content:    content,
                status:     PostStatusActive,
                createdAt:  new Date(),
            };

            const post = await trx.posts().insert(newPost);

            if ((categories.length === 0) || (categories.length > 5)) {
                throw new PostCategoriesNumberError('Post must have between 1 and 5 categories');
            }

            for (const categoryID of categories) {
                const category = await trx.categories().New().filterID(categoryID).get();
                if (category) {
                    await trx.postCategories().insert({
                        postID: postID,
                        categoryID: categoryID,
                        createdAt: new Date(),
                    });
                }
            }

            return post;
        })
    }

    async updatePost(initiatorID, postID, title, content, categories = []) {
        return this.db.transaction(async (trx) => {
            const post = await trx.posts().New().filterID(postID).get();
            if (!post) {
                throw new PostNotFoundError('Post not found');
            }
            if (post.user_id !== initiatorID) {
                throw new PostNotFoundError('Post not found');
            }

            await trx.posts().New().filterID(postID).update({
                title: title,
                content: content,
                updatedAt: new Date(),
            });

            if ((categories.length === 0) || (categories.length > 5)) {
                throw new PostCategoriesNumberError('Post must have between 1 and 5 categories');
            }

            await trx.postCategories().New().filterPostID(postID).delete();

            for (const categoryID of categories) {
                const category = await trx.categories().New().filterID(categoryID).get();
                if (category) {
                    await trx.postCategories().insert({
                        postID: postID,
                        categoryID: categoryID,
                        createdAt: new Date(),
                    });
                }
            }

            const updatedPost = await trx.posts().New().filterID(postID).get();
            const updatedCategories = await trx.postCategories().New().filterPostID(postID).select();
            const categoryIDs = updatedCategories.map(cat => cat.category_id);

            return postFormat(updatedPost, categoryIDs);
        });
    }

    async deletePost(initiatorID, postID) {
        const post = await this.db.posts().New().filterID(postID).get();
        if (!post) {
            throw new PostNotFoundError('Post not found');
        }
        if (post.user_id !== initiatorID) {
            throw new PostNotFoundError('Post not found');
        }

        await this.db.posts().New().filterID(postID).update({
            status: PostStatusDeleted,
            updatedAt: new Date(),
        });

        return true;
    }

    async getPostByID(postID) {
        const post = await this.db.posts().New().filterID(postID).get();
        if (!post) {
            throw new PostNotFoundError('Post not found');
        }

        const categories = await this.db.postCategories().New().filterPostID(postID).select();
        const categoryIDs = categories.map(cat => cat.category_id);

        return postFormat(post, categoryIDs);
    }

    async listPosts({categories = [], userID, title, status}, {limit = 10, offset = 0}, {alphabetical = false, newest = false}) {
        let query = this.db.posts().New();

        if (userID) {
            query = query.filterUserID(userID);
        }
        if (title) {
            query = query.filterTitleLike(title);
        }
        if (status) {
            query = query.filterStatus(status);
        }
        if (categories.length > 0) {
            query = query.filterCategoryIDs(categories);
        }

        if (alphabetical) {
            query = query.orderByTitle(limit);
        } else if (newest) {
            query = query.orderByCreatedAt(limit);
        } else {
            query = query.orderByCreatedAt(limit);
        }

        const total = await query.count();
        const posts = await query.page(limit, offset).select();

        const results = [];
        for (const post of posts) {
            const categories = await this.db.postCategories().New().filterPostID(post.id).select();
            const categoryIDs = categories.map(cat => cat.category_id);
            results.push(postFormat(post, categoryIDs));
        }

        return postListFormat(results, {limit, offset, total});
    }
}

function postFormat(post, categories = []) {
    let res = {
        id:         post.id,
        userID:     post.user_id,
        title:      post.title,
        content:    post.content,
        status:     post.status,
        createdAt:  post.created_at,
        updatedAt:  post.updated_at,
    };
    if (categories.length > 0) {
        res.categories = categories;
    }
    return res;
}

function postListFormat(posts, {limit, offset, total}) {
    let p = posts.map(post => postFormat(post));
    return {
        posts: p,
        limit: limit,
        offset: offset,
        total: total,
    };
}