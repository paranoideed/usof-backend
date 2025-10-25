import { z } from "zod";

export const CreateCommentSchema = z.object({
    post_id:   z.uuid(),
    author_id: z.uuid(),
    parent_id: z.uuid().nullable().optional(),
    content:   z.string().min(1).max(10000),
});

export const GetCommentSchema = z.object({
    initiator_id: z.uuid().optional(),
    comment_id:   z.uuid(),
});

export const UpdateCommentSchema = z.object({
    comment_id: z.uuid(),
    author_id:  z.uuid(),
    content:    z.string().min(1).max(10000),
})

export const DeleteCommentSchema = z.object({
    author_id:  z.uuid(),
    comment_id: z.uuid(),
});

export const LikeCommentSchema = z.object({
    author_id:  z.uuid(),
    comment_id: z.uuid(),
    like_type:  z.enum(['like', 'dislike']),
});

export const DeleteLikeCommentSchema = z.object({
    author_id:  z.uuid(),
    comment_id: z.uuid(),
});

export const ListCommentsSchema = z.object({
    initiator_id:    z.uuid().optional(),
    post_id:         z.uuid().optional(),
    author_id:       z.uuid().optional(),
    author_username: z.string().optional(),
    parent_id:       z.uuid().nullable().optional(),

    offset:  z.coerce.number().int().min(0).default(0),
    limit:   z.coerce.number().int().min(1).max(100).default(20),
});

export const ListCommentLikesSchema = z.object({
    comment_id:      z.uuid().optional(),
    author_id:       z.uuid().optional(),
    author_username: z.string().optional(),
    type:            z.enum(['like', 'dislike']).optional(),

    offset:  z.coerce.number().int().min(0).default(0),
    limit:   z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateCommentInput    = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput    = z.infer<typeof UpdateCommentSchema>;
export type LikeCommentInput      = z.infer<typeof LikeCommentSchema>;
export type DeleteLikeCommentInput = z.infer<typeof DeleteLikeCommentSchema>;
export type ListCommentsInput     = z.infer<typeof ListCommentsSchema>;
export type ListCommentLikesInput = z.infer<typeof ListCommentLikesSchema>;
export type DeleteCommentInput    = z.infer<typeof DeleteCommentSchema>;
export type GetCommentInput       = z.infer<typeof GetCommentSchema>;