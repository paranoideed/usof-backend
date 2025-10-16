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
    status:          z.enum(['active', 'inactive', 'hidden']).optional(),
    title:           z.string().min(1).max(256).optional(),

    category_ids:    z.array(z.uuid()).nonempty().optional(),
    categories_mode: z.enum(['any','all']).default('any'),

    order_by:  z.enum(['created_at','updated_at','likes','dislikes','rating']).default('rating'),
    order_dir: z.enum(['asc','desc']).default('desc'),

    offset:  z.coerce.number().int().min(0).default(0),
    limit:   z.coerce.number().int().min(1).max(100).default(20),
});

export const UpdatePostSchema = z.object({
    post_id:         z.uuid(),
    author_id:       z.uuid(),
    title:           z.string().min(1).max(256).optional(),
    content:         z.string().min(1).optional(),
    categories:      z.array(z.uuid()).min(1).max(5).optional(),
}).superRefine((data, ctx) => {
    const provided = [data.title, data.content].filter(Boolean);

    if (provided.length === 0) {
        ctx.addIssue({
            code: "custom",
            message: "At least one updatable field (title, content) must be provided",
        });
    }

    if (provided.length > 1) {
        ctx.addIssue({
            code: "custom",
            message: "Provide only one of title or content",
        });
    }
});

export const DeletePostSchema = z.object({
    author_id:       z.uuid(),
    post_id:         z.uuid(),
});

export const ChangePostStatusSchema = z.object({
    author_id:       z.uuid(),
    post_id:         z.uuid(),
    status:          z.enum(['active', 'inactive', 'hidden']),
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
export type ChangePostStatusInput = z.infer<typeof ChangePostStatusSchema>;
export type LikePostInput         = z.infer<typeof LikePostSchema>;
export type DeleteLikePostInput   = z.infer<typeof DeleteLikePostSchema>;
export type ListLikesPostsInput = z.infer<typeof ListLikesPostsSchema>;