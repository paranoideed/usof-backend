import { v4 as uuid } from 'uuid';

import Config from "../../utils/config/config";
import {Database} from "../../database/database";
import {PostRow} from "../../database/posts";
import {
    ChangePostStatusInput,
    CreatePostInput,
    DeletePostInput,
    GetPostInput,
    LikePostInput, ListLikedPostsInput, ListLikedPostsSchema,
    ListPostsInput,
    UpdatePostInput
} from "./post.dto";
import {InitiatorNotFound, PermissionDeniedError, PostNotFoundError} from "../errors";
import {PostLikeRow} from "../../database/post_likes";

export type Post = {
    id:        string;
    userId:    string;
    title:     string;
    status:    'active' | 'inactive' | 'hidden'
    content:   string;
    likes:     number;
    dislikes:  number;
    createdAt: Date;
    updatedAt: Date | null;
}

export type PostsList = {
    posts: Post[];
    pagination: { offset: number; limit: number; total: number };
};

export type Like = {
    id:        string;
    postId:    string;
    userId:    string;
    type:      'like' | 'dislike';
    createdAt: Date;
}

export type LikesList = {
    likes: Like[];
    pagination: { offset: number; limit: number; total: number };
}

export class PostDomain {
    private db: Database;

    constructor(cfg: Config) {
        this.db = new Database(cfg.database.sql);
    }

    private async checkRight(initiatorId: string, postId: string): Promise<void> {
        const initiator = await this.db.users().New().filterID(initiatorId).get();
        if (!initiator) {
            throw new InitiatorNotFound('User not found');
        }

        const post = await this.db.posts().New().filterID(postId).get();
        if (!post) {
            throw new PostNotFoundError('Post not found');
        }

        if (initiator.id !== post.user_id && initiator.role !== 'admin') {
            throw new PermissionDeniedError('Permission denied');
        }
    }

    async createPost(params: CreatePostInput): Promise<Post> {
        const postId = uuid();

        const newPost = await this.db.posts().New().insert({
            id:        postId,
            user_id:   params.user_id,
            title:     params.title,
            content:   params.content,
            status:    'active',
            created_at: new Date(),
        });
        if (params.categories && params.categories.length > 0) {
            const categoryLinks = params.categories.map((categoryId) => ({
                post_id:     postId,
                category_id: categoryId,
            }));

            await this.db.postCategories().insert(categoryLinks);
        }

        return PostFormat(newPost);
    }

    async getPost(params: GetPostInput): Promise<Post> {
        const post = await this.db.posts().New().filterID(params.post_id).get();
        if (!post) {
            throw new PostNotFoundError('Post not found');
        }

        return PostFormat(post);
    }

    async updatePost(params: UpdatePostInput): Promise<Post> {
        await this.checkRight(params.initiator_id, params.post_id);

        const patch: { title?: string; content?: string; updated_at?: Date } = {};
        if (Object.prototype.hasOwnProperty.call(params, 'title'))   patch.title = params.title!;
        if (Object.prototype.hasOwnProperty.call(params, 'content')) patch.content = params.content!;
        patch.updated_at = new Date();

        await this.db.posts().New().filterID(params.post_id).update(patch);

        if (params.categories) {
            await this.db.postCategories().New().filterPostID(params.post_id).delete();

            if (params.categories.length > 0) {
                const categoryLinks = params.categories.map((categoryId) => ({
                    post_id:     params.post_id,
                    category_id: categoryId,
                }));
                await this.db.postCategories().insert(categoryLinks);
            }
        }

        const updated = await this.db.posts().New().filterID(params.post_id).get();
        if (!updated) {
            throw new PostNotFoundError('Post not found after update');
        }

        return PostFormat(updated);
    }

    async deletePost(params: DeletePostInput): Promise<void> {
        await this.checkRight(params.initiator_id, params.post_id);

        await this.db.posts().New().filterID(params.post_id).delete();
    }

    async likePost(params: LikePostInput): Promise<Post> {
        let post = await this.db.posts().New().filterID(params.post_id).get();
        if (!post) {
            throw new PostNotFoundError('Post not found');
        }

        if (params.type === 'remove') {
            await this.db.postLikes().New().filterPostID(params.post_id).filterUserID(params.initiator_id).delete();
        } else {
             await this.db.postLikes().New().upsert({
                    id:         uuid(),
                    post_id:    params.post_id,
                    user_id:    params.initiator_id,
                    type:       params.type,
                    created_at: new Date(),
                }
            )
        }

        return this.getPost({ post_id: params.post_id });
    }

    async changePostStatus(params: ChangePostStatusInput): Promise<Post> {
        const initiator = await this.db.users().New().filterID(params.initiator_id).get();
        if (!initiator) {
            throw new InitiatorNotFound('User not found');
        }

        const post = await this.db.posts().New().filterID(params.post_id).get();
        if (!post) {
            throw new PostNotFoundError('Post not found');
        }

        if (initiator.id !== post.user_id && params.status === 'hidden') {
            throw new PermissionDeniedError('Only admin can hide posts');
        } else if (initiator.role === 'admin' && params.status !== 'hidden') {
            throw new PermissionDeniedError('Admin can only set status to hidden');
        }

        await this.db.posts().New().filterID(params.post_id).update({
            status:     params.status,
            updated_at: new Date(),
        });

        const updated = await this.db.posts().New().filterID(params.post_id).get();
        if (!updated) {
            throw new PostNotFoundError('Post not found after status change');
        }

        return PostFormat(updated);
    }

    async listPosts(params: ListPostsInput): Promise<PostsList> {
        let query = this.db.posts().New();

        if (params.user_id) {
            query = query.filterUserID(params.user_id);
        }
        if (params.status) {
            query = query.filterStatus(params.status);
        }
        if (params.title) {
            query = query.filterTitleLike(params.title);
        }

        const total = await query.count();
        const rows = await query.page(params.limit, params.offset).select();

        return {
            posts: rows.map(PostFormat),
            pagination: {
                limit: params.limit,
                offset: params.offset,
                total: total,
            },
        };
    }

    async listLikedPosts(params: ListLikedPostsInput): Promise<LikesList> {
        let query = this.db.postLikes().New();

        if (params.post_id) {
            query = query.filterPostID(params.post_id);
        }
        if (params.user_id) {
            query = query.filterUserID(params.user_id);
        }
        if (params.type) {
            query = query.filterType(params.type);
        }

        const total = await query.count();
        const rows = await query.page(params.limit, params.offset).select();

        return {
            likes: rows.map(postLikeFormat),
            pagination: {
                limit: params.limit,
                offset: params.offset,
                total: total,
            },
        };
    }
}

function PostFormat(row: PostRow): Post {
    return {
        id:        row.id,
        userId:    row.user_id,
        title:     row.title,
        status:    row.status,
        content:   row.content,
        likes:     row.likes,
        dislikes:  row.dislikes,
        createdAt: row.created_at,
        updatedAt: row.updated_at || null,
    };
}

function postLikeFormat(row: PostLikeRow) {
    return {
        id:        row.id,
        postId:    row.post_id,
        userId:    row.user_id,
        type:      row.type,
        createdAt: row.created_at,
    };
}