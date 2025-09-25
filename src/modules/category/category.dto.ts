import { z } from 'zod';

export const CategoryIdSchema = z.object({
    category_id: z.uuid(), // UUID v4 по умолчанию тоже ок
});

export const DeleteCategorySchema = z.object({
    category_id: z.uuid(),
});

export const CreateCategorySchema = z.object({
    title: z.string().min(1).max(64),
    description: z.string().max(1024)
});

export const UpdateCategorySchema = z.object({
    title: z.string().min(1).max(64).optional(),
    description: z.string().max(1024).nullable().optional()
});

export const GetCategorySchema = z.object({
    category_id: z.uuid(),
});

export const ListCategoriesSchema = z.object({
    offset: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type ListCategoriesInput = z.infer<typeof ListCategoriesSchema>;
export type GetCategoryInput = z.infer<typeof CategoryIdSchema>;
export type DeleteCategoryInput = z.infer<typeof DeleteCategorySchema>;