import { z } from "zod";

export const GetProfileSchema = z.object({
    user_id:  z.uuid().optional(),
    email:    z.email().max(256).optional(),
    username: z.string()
        .min(3)
        .max(32)
        .regex(/^[a-zA-Z0-9\-._!]+$/, {
            message: "Username can only contain letters, numbers, and -._!",
        })
        .optional(),
}).superRefine((data, ctx) => {
    const provided = [data.user_id, data.email, data.username].filter(Boolean);

    if (provided.length === 0) {
        ctx.addIssue({
            code: "custom",
            message: "Either user_id, email or username is required",
        });
    }

    if (provided.length > 1) {
        ctx.addIssue({
            code: "custom",
            message: "Provide only one of user_id, email or username",
        });
    }
});

export const GetProfilesSchema = z.object({
    username: z.string().optional(),
    offset:   z.coerce.number().int().min(0).default(0),
    limit:    z.coerce.number().int().min(1).max(100).default(20),
});

export const UpdateProfileSchema = z.object({
    user_id:   z.uuid(),
    username:  z.string().min(3).max(32).regex(/^[a-zA-Z0-9\-._!]+$/, {
        message: "Username can only contain letters, numbers, and -._!",
    }).optional(),
    pseudonym: z.string().max(512).nullable().optional(),
    avatar:    z.url().max(2048).nullable().optional(),
}).superRefine((data, ctx) => {
    const hasChanges =
        Object.prototype.hasOwnProperty.call(data, "username") ||
        Object.prototype.hasOwnProperty.call(data, "pseudonym") ||
        Object.prototype.hasOwnProperty.call(data, "avatar");
    if (!hasChanges) {
        ctx.addIssue({ code: "custom", message: "At least one updatable field (username, pseudonym, avatar) must be provided" });
    }
});

export type GetProfileInput    = z.infer<typeof GetProfileSchema>;
export type GetProfilesInput   = z.infer<typeof GetProfilesSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
