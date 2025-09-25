import { v4 as uuid } from 'uuid';

import {database, Database} from "../../data/database";
import {
    CreateCommentInput,
    DeleteCommentInput,
    GetCommentInput,
    LikeCommentInput,
    ListCommentLikesInput,
    ListCommentsInput,
    UpdateCommentInput
} from "./comment.dto";
import {CommentRow} from "../../data/comments";
import {CommentLikeRow} from "../../data/comment_likes";
import {ForbiddenError, NotFoundError, UnauthorizedError} from "../../api/errors";

export type Comment = {
    id:        string;
    postId:    string;
    userId:    string;
    parentId:  string | null;
    content:   string;
    likes:     number;
    dislikes:  number;
    createdAt: Date;
    updatedAt: Date | null;
}

export type CommentList = {
    data: Comment[];
    pagination: { offset: number; limit: number; total: number };
}

export type Like = {
    id:        string;
    commentId: string;
    userId:    string;
    type:      'like' | 'dislike';
    createdAt: Date;
}

export type LikesList = {
    likes: Like[];
    pagination: { offset: number; limit: number; total: number };
}

export class CommentDomain {
    private db: Database;

    constructor() {
        this.db = database;
    }

    private async checkRight(initiatorId: string, postId: string): Promise<void> {
        const initiator = await this.db.users().New().filterID(initiatorId).get();
        if (!initiator) {
            throw new UnauthorizedError('Initiator profile not found');
        }

        const comment = await this.db.comments().New().filterID(postId).get();
        if (!comment) {
            throw new NotFoundError('Comment not found');
        }

        if (initiator.id !== comment.user_id && initiator.role !== 'admin') {
            throw new ForbiddenError('Permission denied');
        }
    }


    public async createComment(params: CreateCommentInput): Promise<Comment> {
        const user = await this.db.users().New().filterID(params.user_id).get();
        if (!user) {
            throw new UnauthorizedError('Initiator ser not found');
        }

        const post = await this.db.posts().New().filterID(params.post_id).get();
        if (!post) {
            throw new NotFoundError('Post not found');
        }

        if (params.parent_id) {
            const parentComment = await this.db.comments().New().filterID(params.parent_id).get();
            if (!parentComment) {
                throw new NotFoundError('Parent comment not found');
            }
        }

        const row = await this.db.comments().New().insert({
            id:         uuid(),
            post_id:    params.post_id,
            user_id:    params.user_id,
            parent_id:  params.parent_id || null,
            content:    params.content,
            created_at: new Date(),
        });
        return commentFormat(row);
    }

    public async getComment(params: GetCommentInput): Promise<Comment> {
        const row = await this.db.comments().New().filterID(params.comment_id).get();
        if (!row) {
            throw new NotFoundError('Comment not found');
        }
        return commentFormat(row);
    }

    public async listComments(params: ListCommentsInput): Promise<CommentList> {
        let query = this.db.comments().New();
        if (params.post_id) {
            query = query.filterPostID(params.post_id);
        }
        if (params.parent_id) {
            query = query.filterParentID(params.parent_id);
        }
        if (params.user_id) {
            query = query.filterUserID(params.user_id);
        }

        const total = await query.count();
         let rows = await query.page(params.limit, params.offset).select()

        return {
            data: rows.map(commentFormat),
            pagination: {
                offset: params.offset,
                limit:  params.limit,
                total:  total,
            },
        };
    }

    public async updateComment(params: UpdateCommentInput): Promise<Comment> {
        const row = await this.db.comments().New().filterID(params.comment_id).get();
        if (!row) {
            throw new NotFoundError('Comment not found');
        }

        if (row.user_id !== params.initiator_id) {
            throw new ForbiddenError('Permission denied, only author can update comment');
        }

        const now = new Date();

        await this.db.comments().New().filterID(params.comment_id).update({
            content:    params.content,
            updated_at: now,
        });

        row.updated_at = now;
        row.content = params.content;

        return commentFormat(row);
    }

    public async deleteComment(params: DeleteCommentInput): Promise<void> {
        await this.checkRight(params.initiator_id, params.comment_id);

        await this.db.comments().New().filterID(params.comment_id).delete();
    }

    public async likeComment(params: LikeCommentInput): Promise<Comment> {
        const user = await this.db.users().New().filterID(params.initiator_id).get();
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const comment = await this.db.comments().New().filterID(params.comment_id).get();
        if (!comment) {
            throw new NotFoundError('Comment not found');
        }

        if (params.type === 'remove') {
            await this.db.commentLikes().New().filterCommentID(params.comment_id).filterUserID(params.initiator_id).delete();
        } else {
            await this.db.commentLikes().New().upsert({
                id:         uuid(),
                comment_id: params.comment_id,
                user_id:    params.initiator_id,
                type:       params.type,
                created_at: new Date(),
            })
        }

        return this.getComment({comment_id: params.comment_id})
    }

    public async listCommentLikes(params: ListCommentLikesInput): Promise<LikesList> {
        let query = this.db.commentLikes().New();
        if (params.comment_id) {
            query = query.filterCommentID(params.comment_id);
        }
        if (params.user_id) {
            query = query.filterUserID(params.user_id);
        }
        if (params.type) {
            query = query.filterType(params.type);
        }

        const total = await query.count();
        let rows = await query.page(params.limit, params.offset).select()

        return {
            likes: rows.map(commentLikeFormat),
            pagination: {
                offset: params.offset,
                limit:  params.limit,
                total:  total,
            },
        }
    }
}

function commentFormat(row: CommentRow): Comment {
    return {
        id:        row.id,
        postId:    row.post_id,
        userId:    row.user_id,
        parentId:  row.parent_id || null,
        content:   row.content,
        likes:     row.likes,
        dislikes:  row.dislikes,
        createdAt: row.created_at,
        updatedAt: row.updated_at || null,
    };
}

function commentLikeFormat(row: CommentLikeRow) {
    return {
        id:        row.id,
        commentId: row.comment_id,
        userId:    row.user_id,
        type:      row.type,
        createdAt: row.created_at,
    };
}