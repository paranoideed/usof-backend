import { z } from "zod";

export const GetProfileSchema = z.object({
    user_id:  z.uuid().optional(),
    email:    z.email().max(256).optional(),
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9\-._!]+$/, {
        message: "Username can only contain letters, numbers, and -._!",
    }).optional(),
});

export const GetProfilesSchema = z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9\-._!]+$/, {
        message: "Username can only contain letters, numbers, and -._!",
    }),
    offset:   z.coerce.number().int().min(0).default(0),
    limit:    z.coerce.number().int().min(1).max(100).default(20),
});

export type GetProfileInput = z.infer<typeof GetProfileSchema>;
export type GetProfilesInput = z.infer<typeof GetProfilesSchema>;
