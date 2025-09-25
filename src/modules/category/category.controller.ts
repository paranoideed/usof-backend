import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import {MustRequestBody} from "../../api/decorators/request_body";
import {CategoryDomain} from "./category.domain";
import {
    CreateCategorySchema,
    DeleteCategorySchema, GetCategorySchema,
    ListCategoriesInput,
    ListCategoriesSchema,
    UpdateCategorySchema
} from "./category.dto";

class CategoryController {
    private domain: CategoryDomain;

    constructor() {
        this.domain = new CategoryDomain();
    }

    @MustRequestBody()
    async createCategory(req: Request, res: Response, next: NextFunction) {
        const parsed = CreateCategorySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const category = await this.domain.createCategory(req.body);

            return res.status(201).json(category);
        } catch (err) {
            next(err);
        }
    }

    async listCategories(req: Request, res: Response, next: NextFunction) {
        const parsed = ListCategoriesSchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const categories = await this.domain.listCategories(parsed.data);

            return res.status(200).json({
                data: categories.data,
                total: categories.pagination.total,
                limit: categories.pagination.limit,
                offset: categories.pagination.offset
            });
        } catch (err) {
            next(err);
        }
    }

    async getCategory(req: Request, res: Response, next: NextFunction) {
        const parsed = GetCategorySchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }
        try {
            const category = await this.domain.getCategory(parsed.data);
            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }

            return res.status(200).json(category);
        } catch (err) {
            next(err);
        }
    }

    @MustRequestBody()
    async updateCategory(req: Request, res: Response, next: NextFunction) {
        const parsed = UpdateCategorySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const category = await this.domain.updateCategory(req.params.id, req.body);

            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }

            return res.status(200).json(category);
        } catch (err) {
            next(err);
        }
    }

    async deleteCategory(req: Request, res: Response, next: NextFunction) {
        const parsed = DeleteCategorySchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.deleteCategory({ category_id: req.params.id });
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

export const categoryController = new CategoryController();