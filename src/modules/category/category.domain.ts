import { v4 as uuid } from 'uuid';

import { Database } from '../../database/database';
import { CategoryRow } from "../../database/categories";
import { CategoryAlreadyExist, CategoryNotFoundError } from "../errors";
import {
    GetCategoryIdInput,
    CreateCategoryInput,
    UpdateCategoryInput,
    GetCategoriesInput,
} from "./category.dto.js";

export type Category = {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date | null;
};

export class CategoriesDomain {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async createCategory(params: CreateCategoryInput): Promise<Category> {
        const existing = await this.db.categories().filterTitle(params.title).get();
        if (existing) {
            throw new CategoryAlreadyExist('Category with this title already exists');
        }

        const category = await this.db.categories().insert({
            id:          uuid(),
            title:       params.title,
            description: params.description,
            created_at:  new Date(),
        });

        return categoryFormat(category);
    }

    async updateCategory(id: string, params: UpdateCategoryInput): Promise<Category> {
        const row = await this.db.categories().filterID(id).get();
        if (!row) {
            throw new CategoryNotFoundError('Category not found');
        }

        const patch: { title?: string; description?: string | null; updated_at?: Date } = {};
        if (Object.prototype.hasOwnProperty.call(params, 'title'))       patch.title = params.title!;
        if (Object.prototype.hasOwnProperty.call(params, 'description')) patch.description = params.description;
        patch.updated_at = new Date();

        await this.db.categories().filterID(id).update(patch);

        const updated = await this.db.categories().filterID(id).get();
        if (!updated) {
            throw new CategoryNotFoundError('Category not found after update');
        }

        return categoryFormat(updated);
    }

    async getCategoryByID(params: GetCategoryIdInput): Promise<Category> {
        const category = await this.db.categories().filterID(params.category_id).get();
        if (!category) {
            throw new CategoryNotFoundError('Category not found');
        }

        return categoryFormat(category);
    }

    async listCategories(params: GetCategoriesInput): Promise<{
        data: Category[],
        pagination: {
            offset: number;
            limit: number;
            total: number;
        }
    }> {
        const rows = (await this.db.categories().page(params.limit, params.offset).select()) as CategoryRow[];
        const total = await this.db.categories().count();

        const categories: Category[] = [];
        for (const row of rows) {
            categories.push(categoryFormat(row));
        }

        return {
            data: categories,
            pagination: {
                offset: params.offset,
                limit: params.limit,
                total: total,
            }
        };
    }

    async deleteCategoryByID(params: GetCategoryIdInput): Promise<void> {
        const category = await this.db.categories().filterID(params.category_id).get();
        if (!category) {
            throw new CategoryNotFoundError('Category not found');
        }

        await this.db.categories().filterID(params.category_id).delete();
    }
}

function categoryFormat(row: CategoryRow): Category {
    return {
        id:          row.id,
        title:       row.title,
        description: row.description,
        createdAt:   row.created_at,
        updatedAt:   row.updated_at,
    };
}