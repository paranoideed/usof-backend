import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import {log} from "../../utils/logger/logger";


import {CategoryDomain} from "./category.domain";
import {
    CreateCategorySchema,
    DeleteCategorySchema,
    GetCategorySchema,
    ListCategoriesSchema,
    UpdateCategorySchema
} from "./category.dto";

class CategoryController {
    private domain: CategoryDomain;

    constructor() {
        this.domain = new CategoryDomain();
    }

    
    async createCategory(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            title:       req.body?.title,
            description: req.body?.description,
        };

        const parsed = CreateCategorySchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in createCategory", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const category = await this.domain.createCategory(parsed.data);

            return res.status(201).json(category);
        } catch (err) {
            log.error("Error in createCategory", { error: err });

            next(err);
        }
    }

    async listCategories(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            limit:  req.query.limit,
            offset: req.query.offset,
        };

        const parsed = ListCategoriesSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in listCategories", { errors: parsed.error });

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
            log.error("Error in listCategories", { error: err });

            next(err);
        }
    }

    async getCategory(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            category_id: req.params?.category_id,
        }

        const parsed = GetCategorySchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in getCategory", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }
        try {
            const category = await this.domain.getCategory(parsed.data);
            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }

            return res.status(200).json(category);
        } catch (err) {
            log.error("Error in getCategory", { error: err });

            next(err);
        }
    }

    
    async updateCategory(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            category_id: req.params.category_id,
            title: req.body?.title,
            description: req.body?.description
        }

        const parsed = UpdateCategorySchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in updateCategory", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const category = await this.domain.updateCategory(parsed.data);

            return res.status(200).json(category);
        } catch (err) {
            log.error("Error in updateCategory", { error: err });

            next(err);
        }
    }

    async deleteCategory(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            category_id: req.params?.category_id,
        }

        const parsed = DeleteCategorySchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in deleteCategory", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.deleteCategory(parsed.data);

            return res.status(204).send();
        } catch (err) {
            log.error("Error in deleteCategory", { error: err });

            next(err);
        }
    }
}

export const categoryController = new CategoryController();