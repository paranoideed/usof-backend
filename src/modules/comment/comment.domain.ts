import { v4 as uuid } from "uuid";

import database, {Database} from "../../repo/sql/database";

import {
    CreateCommentInput,
    DeleteCommentInput,
    DeleteLikeCommentInput,
    GetCommentInput,
    LikeCommentInput,
    ListCommentLikesInput,
    ListCommentsInput,
    UpdateCommentInput
} from "./comment.dto";
import {
    Forbidden,
    Internal,
    NotFound,
    Unauthorized,
} from "../../api/errors";

export type CommentData = {
    id:              string;
    post_id:         string;
    author_id:       string;
    author_username: string;
    parent_id:       string | null;

    replies_count:   number;

    content:  string;
    likes:    number;
    dislikes: number;

    created_at: Date;
    updated_at: Date | null;
}

export type Comment = {
    data: CommentData;
    user_reaction: string | null;
}

export type CommentList = {
    data: Comment[];
    pagination: { offset: number; limit: number; total: number };
}

export type Like = {
    id:              string;
    comment_id:      string;
    author_id:       string;
    author_username: string;
    type:            'like' | 'dislike';
    created_at:      Date;
}

export type LikesList = {
    likes: Like[];
    pagination: { offset: number; limit: number; total: number };
}

export default class CommentDomain {
    private db: Database;

    constructor() {
        this.db = database;
    }

    private async checkRight(initiatorId: string, postId: string): Promise<void> {
        const initiator = await this.db.users().filterID(initiatorId).get();
        if (!initiator) {
            throw new Unauthorized('Initiator profile not found');
        }

        const comment = await this.db.comments().filterID(postId).get();
        if (!comment) {
            throw new NotFound('Comment not found');
        }

        if (initiator.id !== comment.author_id && initiator.role !== 'admin') {
            throw new Forbidden('Permission denied');
        }
    }

    public async createComment(params: CreateCommentInput): Promise<Comment> {
        const user = await this.db.users().filterID(params.author_id).get();
        if (!user) {
            throw new Unauthorized('Initiator are not found');
        }

        const post = await this.db.posts().filterID(params.post_id).get();
        if (!post) {
            throw new NotFound('Post not found');
        }

        if (params.parent_id) {
            const parentComment = await this.db.comments().filterID(params.parent_id).get();
            if (!parentComment) {
                throw new NotFound('Parent comment not found');
            }
        }

        const commID =  uuid()
        await this.db.transaction(async (trx) => {
            const row = await trx.comments.insert({
                id:              commID,
                post_id:         params.post_id,
                author_id:       params.author_id,
                parent_id:       params.parent_id || null,
                content:         params.content,
                created_at:      new Date(),
            });
            if (!row) {
                throw new Internal('Failed to create comment');
            }

            if (params.parent_id) {
                 await trx.comments.filterID(params.parent_id).addReplies();
            }
        });

        return this.getComment({comment_id: commID});
    }

    public async getComment(params: GetCommentInput): Promise<Comment> {
        const row = await this.db.comments().
            filterID(params.comment_id).
            getWithDetails(params.initiator_id);
        if (!row) {
            throw new NotFound('Comment not found');
        }
        return row;
    }

    public async listComments(params: ListCommentsInput): Promise<CommentList> {
        let query = this.db.comments();
        if (params.post_id) {
            query = query.filterPostID(params.post_id);
        }
        if (params.parent_id) {
            query = query.filterParentID(params.parent_id);
        } else {
            query = query.filterParentID(null);
        }

        if (params.author_username) {
            query = query.filterUsername(params.author_username);
        }
        if (params.author_id) {
            query = query.filterAuthorID(params.author_id);
        }

        const total = await query.count();
        let rows = await query.
            orderByRating(false).
            page(params.limit, params.offset).
            selectWithDetails(params.initiator_id);

        return {
            data: rows,
            pagination: {
                offset: params.offset,
                limit:  params.limit,
                total:  total,
            },
        };
    }

    public async updateComment(params: UpdateCommentInput): Promise<Comment> {
        const row = await this.db.comments().filterID(params.comment_id).get();
        if (!row) {
            throw new NotFound('Comment not found');
        }

        if (row.author_id !== params.author_id) {
            throw new Forbidden('Permission denied, only author can update comment');
        }

        const now = new Date();

        await this.db.comments().filterID(params.comment_id).update({
            content:    params.content,
            updated_at: now,
        });

        return this.getComment({comment_id: params.comment_id} );
    }

    public async deleteComment(params: DeleteCommentInput): Promise<void> {
        await this.checkRight(params.author_id, params.comment_id);

        const comment = await this.db.comments().filterID(params.comment_id).get();
        if (!comment) {
            throw new NotFound('Comment not found');
        }

        await this.db.transaction(async (trx) => {
            if (comment.parent_id) {
                await trx.comments.filterID(comment.parent_id).removeReplies();
            }

            await trx.comments.filterID(params.comment_id).delete();
        });
    }

    public async likeComment(params: LikeCommentInput): Promise<Comment> {
        const user = await this.db.users().filterID(params.author_id).get();
        if (!user) {
            throw new NotFound('User not found');
        }

        const comment = await this.db.comments().filterID(params.comment_id).get();
        if (!comment) {
            throw new NotFound('Comment not found');
        }

        await this.db.commentLikes().upsert({
            id:              uuid(),
            comment_id:      params.comment_id,
            author_id:       params.author_id,
            type:            params.type,
            created_at:      new Date(),
        })

        return this.getComment({comment_id: params.comment_id})
    }

    public async deleteLike(params: DeleteLikeCommentInput): Promise<Comment> {
        const user = await this.db.users().filterID(params.author_id).get();
        if (!user) {
            throw new NotFound('User not found');
        }

        const comment = await this.db.comments().filterID(params.comment_id).get();
        if (!comment) {
            throw new NotFound('Comment not found');
        }

        await this.db.commentLikes().filterCommentID(params.comment_id).filterAuthorID(params.author_id).delete();

        return this.getComment({comment_id: params.comment_id})
    }

    public async listCommentLikes(params: ListCommentLikesInput): Promise<LikesList> {
        let query = this.db.commentLikes();
        if (params.comment_id) {
            query = query.filterCommentID(params.comment_id);
        }
        if (params.author_id) {
            query = query.filterAuthorID(params.author_id);
        }
        if (params.type) {
            query = query.filterType(params.type);
        }

        const total = await query.count();
        let rows = await query.page(params.limit, params.offset).select()

        return {
            likes: rows,
            pagination: {
                offset: params.offset,
                limit:  params.limit,
                total:  total,
            },
        }
    }
}
