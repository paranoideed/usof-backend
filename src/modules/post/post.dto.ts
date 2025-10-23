import { z } from "zod";

export const CreatePostSchema = z.object({
    author_id:       z.uuid(),
    title:           z.string().min(1).max(256),
    content:         z.string().min(1),
    categories:      z.array(z.uuid()).min(1).max(5),
});

export const GetPostSchema = z.object({
    user_id: z.uuid().optional(),
    post_id: z.uuid(),
});

export const ListPostsSchema = z.object({
    initiator_id:    z.uuid().optional(),
    author_id:       z.uuid().optional(),
    author_username: z.string().optional(),
    category_id:     z.uuid().optional(),
    status:          z.enum(['active', 'closed']).optional(),
    title:           z.string().min(1).max(256).optional(),

    order_by:  z.enum(['newest','oldest','likes','dislikes','rating']).default('rating'),
    order_dir: z.enum(['asc','desc']).default('desc'),

    offset:  z.coerce.number().int().min(0).default(0),
    limit:   z.coerce.number().int().min(1).max(100).default(20),
});

export const UpdatePostSchema = z.object({
    post_id:         z.uuid(),
    initiator_id:    z.uuid(),
    title:           z.string().min(1).max(256),
    content:         z.string().min(1),
    categories:      z.array(z.uuid()).min(1).max(5),
}).superRefine((data, ctx) => {
    const provided = [data.title, data.content].filter(Boolean);

    if (provided.length === 0) {
        ctx.addIssue({
            code: "custom",
            message: "At least one updatable field (title, content) must be provided",
        });
    }
});

export const UpdatePostStatusSchema = z.object({
    initiator_id:       z.uuid(),
    initiator_role:     z.string(),
    post_id:            z.uuid(),
    status:             z.enum(['active', 'closed']),
});

export const DeletePostSchema = z.object({
    initiator_id:       z.uuid(),
    post_id:         z.uuid(),
});

export const LikePostSchema = z.object({
    initiator_id:    z.uuid(),
    post_id:         z.uuid(),
    type:            z.enum(['like', 'dislike']),
});

export const DeleteLikePostSchema = z.object({
    initiator_id:    z.uuid(),
    post_id:         z.uuid(),
});

export const ListLikesPostsSchema = z.object({
    post_id:         z.uuid().optional(),
    author_id:       z.uuid().optional(),
    author_username: z.string().optional(),
    type:            z.enum(['like', 'dislike']).optional(),

    offset:    z.coerce.number().int().min(0).default(0),
    limit:     z.coerce.number().int().min(1).max(100).default(20),
})

export type CreatePostInput       = z.infer<typeof CreatePostSchema>;
export type GetPostInput          = z.infer<typeof GetPostSchema>;
export type ListPostsInput        = z.infer<typeof ListPostsSchema>;
export type UpdatePostInput       = z.infer<typeof UpdatePostSchema>;
export type DeletePostInput       = z.infer<typeof DeletePostSchema>;
export type UpdatePostStatusInput = z.infer<typeof UpdatePostStatusSchema>;
export type LikePostInput         = z.infer<typeof LikePostSchema>;
export type DeleteLikePostInput   = z.infer<typeof DeleteLikePostSchema>;
export type ListLikesPostsInput = z.infer<typeof ListLikesPostsSchema>;