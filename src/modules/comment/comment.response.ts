import {Comment, CommentList, LikesList} from "./comment.domain";

export type CommentResponse = {
    data: {
        id: string;
        type: "comment"
        attributes: {
            post_id:         string;
            author_id:       string;
            author_username: string;
            parent_id:       string | null;
            user_reaction: string | null;

            replies_count:   number;

            content:  string;
            likes:    number;
            dislikes: number;

            created_at: Date;
            updated_at: Date | null;
        }
    }
}

export function commentResponse(input: Comment): CommentResponse {
    return {
        data: {
            id: input.id,
            type: "comment",
            attributes: {
                post_id:         input.post_id,
                author_id:       input.author_id,
                author_username: input.author_username,
                parent_id:       input.parent_id,
                user_reaction:   input.user_reaction,

                replies_count:   input.replies_count,

                content:  input.content,
                likes:    input.likes,
                dislikes: input.dislikes,

                created_at: input.created_at,
                updated_at: input.updated_at,
            }
        }
    };
}

export type CommentsListResponse = {
    data: {
        id: string;
        type: "comment"
        attributes: {
            post_id:         string;
            author_id:       string;
            author_username: string;
            parent_id:       string | null;
            user_reaction: string | null;

            replies_count:   number;

            content:  string;
            likes:    number;
            dislikes: number;

            created_at: Date;
            updated_at: Date | null;
        }
    }[];
    meta: {
        total:  number;
        limit:  number;
        offset: number;
    }
}

export function commentListResponse(items: CommentList): CommentsListResponse {
    return {
        data: items.data.map((input) => ({
            id: input.id,
            type: "comment",
            attributes: {
                post_id:         input.post_id,
                author_id:       input.author_id,
                author_username: input.author_username,
                parent_id:       input.parent_id,
                user_reaction:   input.user_reaction,

                replies_count:   input.replies_count,

                content:  input.content,
                likes:    input.likes,
                dislikes: input.dislikes,

                created_at: input.created_at,
                updated_at: input.updated_at,
            }
        })),
        meta: {
            total:  items.pagination.total,
            limit:  items.pagination.limit,
            offset: items.pagination.offset,
        }
    };
}

export type CommentLikeListResponse = {
    data: {
        id: string;
        type: "comment_like"
        attributes: {
            comment_id:      string;
            author_id:       string;
            author_username: string;
            type:            'like' | 'dislike';
            created_at:      Date;
        }
    }[];
    meta: {
        total:  number;
        limit:  number;
        offset: number;
    }
}

export function commentLikeListResponse(items: LikesList): CommentLikeListResponse {
    return {
        data: items.likes.map((input) => ({
            id: input.id,
            type: "comment_like",
            attributes: {
                comment_id:      input.comment_id,
                author_id:       input.author_id,
                author_username: input.author_username,
                type:            input.type,
                created_at:      input.created_at,
            }
        })),
        meta: {
            total:  items.pagination.total,
            limit:  items.pagination.limit,
            offset: items.pagination.offset,
        }
    };
}