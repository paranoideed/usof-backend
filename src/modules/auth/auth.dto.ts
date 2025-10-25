import { z } from 'zod';

const passwordRegex = /^[a-zA-Z0-9\-.&?+@$%^:_!]+$/;
const usernameRegex = /^[a-zA-Z0-9\-._!]+$/;
const usernameError = "Username can only contain letters, numbers, and -._!";
const passwordError = "Password can only contain letters, numbers, and -.&?+@$%^:_!";

export const RegisterDefaultSchema = z.object({
    email: z.email().max(256),
    username: z.string().min(3).max(32)
        .regex(usernameRegex, {
            message: usernameError,
        }),
    password: z.string().min(6).max(64)
        .regex(passwordRegex, {
            message: passwordError,
        }),
});

export const RegisterSchemaByAdmin = z.object({
    email: z.email().max(256),
    role: z.enum(['user', 'admin']),
    username: z.string().min(3).max(32)
        .regex(usernameRegex, {
            message: usernameError,
        }),
    password: z.string().min(6).max(64)
        .regex(passwordRegex, {
            message: passwordError,
        }),
});

export const LoginSchema = z.object({
    username: z.string().min(3).max(32).regex(usernameRegex, {
        message: usernameError,
    }).optional(),
    email:    z.email().max(256).optional(),
    password: z.string()
}).superRefine((data, ctx) => {
    const hasUsername = !!data.username;
    const hasEmail = !!data.email;

    if (!hasUsername && !hasEmail) {
        ctx.addIssue({
            code: "custom",
            message: "Either username or email is required",
            path: ["username"],
        });
    }

    if (hasUsername && hasEmail) {
        ctx.addIssue({
            code: "custom",
            message: "Provide either username or email, not both",
            path: ["username"],
        });
    }
});

export const ResetPassword = z.object({
    userId:     z.uuid(),
    newPassword: z.string().min(6).max(64).regex(passwordRegex, {
        message: passwordError,
    }),
});

export const DeleteAccountSchema = z.object({
    userId: z.uuid(),
});

export type RegisterDefaultInput = z.infer<typeof RegisterDefaultSchema>;
export type RegisterByAdminInput = z.infer<typeof RegisterSchemaByAdmin>;
export type LoginInput           = z.infer<typeof LoginSchema>;
export type ResetPasswordInput   = z.infer<typeof ResetPassword>;
export type DeleteAccountInput   = z.infer<typeof DeleteAccountSchema>;