import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import log from "../../utils/logger";

import {
    CreateCategorySchema,
    DeleteCategorySchema,
    GetCategorySchema,
    ListCategoriesSchema,
    UpdateCategorySchema
} from "./category.dto";
import CategoryDomain from "./category.domain";
import {categoryListResponse, categoryResponse} from "./category.response";

export default class CategoryController {
    private domain: CategoryDomain;

    constructor() {
        this.domain = new CategoryDomain();
    }

    async createCategory(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (!req.user?.role || req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (req.body?.data?.type !== "category") {
            return res.status(400).json({ message: "Invalid type" });
        }

        const candidate = {
            title:       req.body?.data?.attributes?.title,
            description: req.body?.data?.attributes?.description,
        };

        const parsed = CreateCategorySchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in createCategory", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const category = await this.domain.createCategory(parsed.data);

            return res.status(201).json(
                categoryResponse(category)
            );
        } catch (err) {
            log.error("Error in createCategory", { error: err });

            next(err);
        }
    }

    async listCategories(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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

            return res.status(200).json(
                categoryListResponse(categories)
            );
        } catch (err) {
            log.error("Error in listCategories", { error: err });

            next(err);
        }
    }

    async getCategory(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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

            return res.status(200).json(
                categoryResponse(category)
            );
        } catch (err) {
            log.error("Error in getCategory", { error: err });

            next(err);
        }
    }

    async updateCategory(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (!req.user?.role || req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (req.body?.data?.type !== "category") {
            log.error("Invalid type in updateCategory", { type: req.body?.data?.type });

            return res.status(400).json({ message: "Invalid type" });
        }

        if (req.params?.category_id !== req.body?.data?.id) {
            log.error("Category ID mismatch in updateCategory", { param_id: req.params?.category_id, body_id: req.body?.data?.id });

            return res.status(400).json({ message: "Category ID in URL and body do not match" });
        }

        const candidate = {
            category_id: req.params.category_id,
            title: req.body?.data?.attributes?.title,
            description: req.body?.data?.attributes?.description
        }

        const parsed = UpdateCategorySchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in updateCategory", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const category = await this.domain.updateCategory(parsed.data);

            return res.status(200).json(
                categoryResponse(category)
            );
        } catch (err) {
            log.error("Error in updateCategory", { error: err });

            next(err);
        }
    }

    async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (!req.user?.role || req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }

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