import { z } from "zod";

export const CreateCommentSchema = z.object({
    post_id:   z.uuid(),
    user_id:   z.uuid(),
    parent_id: z.uuid().nullable().optional(),
    content:   z.string().min(1).max(1000),
});

export const GetCommentSchema = z.object({
    comment_id: z.uuid(),
});

export const UpdateCommentSchema = z.object({
    comment_id:   z.uuid(),
    initiator_id: z.uuid(),
    content:      z.string().min(1).max(1000),
})

export const DeleteCommentSchema = z.object({
    initiator_id: z.uuid(),
    comment_id:   z.uuid(),
});

export const LikeCommentSchema = z.object({
    initiator_id: z.uuid(),
    comment_id:   z.uuid(),
    type:         z.enum(['like', 'dislike', 'remove']),
});

export const ListCommentsSchema = z.object({
    post_id: z.uuid().optional(),
    user_id: z.uuid().optional(),
    parent_id: z.uuid().nullable().optional(),

    offset:  z.coerce.number().int().min(0).default(0),
    limit:   z.coerce.number().int().min(1).max(100).default(20),
});

export const ListCommentLikesSchema = z.object({
    comment_id: z.uuid().optional(),
    user_id:    z.uuid().optional(),
    type:       z.enum(['like', 'dislike']).optional(),

    offset:  z.coerce.number().int().min(0).default(0),
    limit:   z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateCommentInput    = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput    = z.infer<typeof UpdateCommentSchema>;
export type LikeCommentInput      = z.infer<typeof LikeCommentSchema>;
export type ListCommentsInput     = z.infer<typeof ListCommentsSchema>;
export type ListCommentLikesInput = z.infer<typeof ListCommentLikesSchema>;
export type DeleteCommentInput    = z.infer<typeof DeleteCommentSchema>;
export type GetCommentInput       = z.infer<typeof GetCommentSchema>;