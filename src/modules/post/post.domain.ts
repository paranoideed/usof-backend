import { v4 as uuid } from 'uuid';

import database, {Database} from '../../repo/sql/database';
import log from "../../utils/logger";

import {
    UpdatePostStatusInput,
    CreatePostInput, DeleteLikePostInput,
    DeletePostInput,
    GetPostInput,
    LikePostInput,
    ListLikesPostsInput,
    ListPostsInput,
    UpdatePostInput
} from "./post.dto";
import {
    Conflict,
    Forbidden,
    NotFound,
    Unauthorized,
} from "../../api/errors";
import {Category} from "../category/category.domain";

export type PostData = {
    id:              string;
    author_id:       string;
    author_username: string;
    title:           string;
    status:          string;
    content:         string;
    likes:           number;
    dislikes:        number;
    created_at:      Date;
    updated_at:      Date | null;
}

export type PostsList = {
    posts: Post[];
    pagination: {
        offset: number;
        limit: number;
        total: number;
    };
};

export type Post = {
    data:          PostData;
    categories:    Category[];
    user_reaction: string | null;
}

export type Like = {
    id:              string;
    post_id:         string;
    author_id:       string;
    author_username: string;
    type:            'like' | 'dislike';
    created_at:      Date;
}

export type LikesList = {
    data: Like[];
    pagination: { offset: number; limit: number; total: number };
}

export default class PostDomain {
    private db: Database;

    constructor() {
        this.db = database;
    }

    private async checkRight(initiatorId: string, postId: string): Promise<void> {
        const initiator = await this.db.users().filterID(initiatorId).get();
        if (!initiator) {
            throw new Unauthorized('Initiator profile not found');
        }

        const post = await this.db.posts().filterID(postId).get();
        if (!post) {
            throw new NotFound('Post not found');
        }

        if (initiator.id !== post.author_id && initiator.role !== 'admin') {
            throw new Forbidden('Permission denied');
        }
    }

    async createPost(params: CreatePostInput): Promise<Post> {
        const user = await this.db.users().filterID(params.author_id).get();
        if (!user) {
            throw new Unauthorized('User not found');
        }

        const postId = uuid();

        await this.db.transaction(async (transaction) => {
            const newPost = await this.db.posts().insert({
                id:              postId,
                author_id:       params.author_id,
                title:           params.title,
                content:         params.content,
                status:          'active',
                created_at:      new Date(),
            });
            const categoryLinks = params.categories.map((categoryId) => ({
                post_id:     postId,
                category_id: categoryId,
            }));

            await this.db.postCategories().insert(categoryLinks);
        })


        return this.getPost({ post_id: postId });
    }

    async getPost(params: GetPostInput): Promise<Post> {
        const post = await this.db.posts().filterID(params.post_id).getWithDetails(params.user_id);
        if (!post) {
            throw new NotFound('Post not found');
        }

        return post;
    }

    async updatePost(params: UpdatePostInput): Promise<Post> {
        await this.checkRight(params.initiator_id, params.post_id);

        const patch: { title?: string; content?: string; updated_at?: Date } = {};
        if (Object.prototype.hasOwnProperty.call(params, 'title'))   patch.title = params.title!;
        if (Object.prototype.hasOwnProperty.call(params, 'content')) patch.content = params.content!;
        patch.updated_at = new Date();

        await this.db.posts().filterID(params.post_id).update(patch);

        await this.db.transaction(async (transaction) => {
            await transaction.postCategories.filterPostID(params.post_id).delete();

            if (params.categories.length > 0) {
                const categoryLinks = params.categories.map((categoryId) => ({
                    post_id:     params.post_id,
                    category_id: categoryId,
                }));
                await transaction.postCategories.insert(categoryLinks);
            }
        });

        const updated = await this.db.posts().filterID(params.post_id).getWithDetails(params.initiator_id);
        if (!updated) {
            throw new NotFound('Post not found after update');
        }

        return updated;
    }

    async deletePost(params: DeletePostInput): Promise<void> {
        await this.checkRight(params.initiator_id, params.post_id);

        await this.db.posts().filterID(params.post_id).delete();
    }

    async likePost(params: LikePostInput): Promise<Post> {
        let post = await this.db.posts().filterID(params.post_id).get();
        if (!post) {
            throw new NotFound('Post not found');
        }

        const user = await this.db.users().filterID(params.initiator_id).get();
        if (!user) {
            throw new Unauthorized('User not found');
        }

        await this.db.postLikes().upsert({
            id:              uuid(),
            post_id:         params.post_id,
            author_id:       params.initiator_id,
            type:            params.type,
            created_at:      new Date(),
        });

        return this.getPost({ post_id: params.post_id });
    }

    async deleteLike(params: DeleteLikePostInput): Promise<Post> {
        const post = await this.db.posts().filterID(params.post_id).get();
        if (!post) {
            throw new NotFound('Post not found');
        }

        await this.db.postLikes().filterPostID(params.post_id).filterAuthorID(params.initiator_id).delete();

        return this.getPost({ post_id: params.post_id });
    }

    async updatePostStatus(params: UpdatePostStatusInput): Promise<Post> {
        const initiator = await this.db.users().filterID(params.initiator_id).get();
        if (!initiator) {
            throw new Unauthorized('User not found');
        }

        const post = await this.db.posts().filterID(params.post_id).get();
        if (!post) {
            throw new NotFound('Post not found');
        }

        if (initiator.id !== post.author_id && initiator.role !== 'admin') {
            throw new Conflict('Only admin can change status not own posts');
        }

        await this.db.posts().filterID(params.post_id).update({
            status:     params.status,
            updated_at: new Date(),
        });

        const updated = await this.db.posts().filterID(params.post_id).getWithDetails(params.initiator_id);
        if (!updated) {
            throw new NotFound('Post not found after status change');
        }

        return updated;
    }

    async listPosts(params: ListPostsInput): Promise<PostsList> {
        let query = this.db.posts();

        if (params.author_id) {
            query = query.filterAuthorID(params.author_id);
        }

        if (params.status) query = query.filterStatus(params.status);
        if (params.title)  query = query.filterTitleLike(params.title);

        if (params.category_id != null) {
            query.filterCategory(params.category_id)
        }

        const asc = params.order_dir === 'asc';
        switch (params.order_by) {
            case 'newest':     query = query.orderByCreatedAt(asc); break;
            case 'oldest':     query = query.orderByCreatedAt(!asc); break;
            case 'likes':      query = query.orderByLikes(asc);     break;
            case 'dislikes':   query = query.orderByDislikes(asc);  break;
            case 'rating':     query = query.orderByRating(asc);    break; // likes - dislikes
        }

        const total = await query.count();
        const rows  = await query.page(params.limit, params.offset).selectWithDetails(params.initiator_id);

        log.info("listPosts rows ", rows);

        return {
            posts: rows,
            pagination: { limit: params.limit, offset: params.offset, total },
        };
    }

    async listLikesPosts(params: ListLikesPostsInput): Promise<LikesList> {
        let query = this.db.postLikes();

        if (params.post_id) {
            query = query.filterPostID(params.post_id);
        }
        if (params.author_id) {
            query = query.filterAuthorID(params.author_id);
        }
        if (params.type) {
            query = query.filterType(params.type);
        }

        const total = await query.count();
        const rows = await query.page(params.limit, params.offset).select();

        return {
            data: rows,
            pagination: {
                limit: params.limit,
                offset: params.offset,
                total: total,
            },
        };
    }
}
