import { v4 as uuid } from 'uuid';

import database, {Database} from '../../repo/sql/database';

import {
    GetCategoryInput,
    CreateCategoryInput,
    UpdateCategoryInput,
    ListCategoriesInput, DeleteCategoryInput,
} from "./category.dto.js";
import {Forbidden, NotFound} from "../../api/errors";

export type Category = {
    id:          string;
    title:       string;
    description: string;
    created_at:  Date;
    updated_at:  Date | null;
};

export type CategoryList = {
    data: Category[];
    pagination: {
        offset: number;
        limit: number;
        total: number;
    };
};

export default class CategoryDomain {
    private db: Database;

    constructor() {
        this.db = database;
    }

    async createCategory(params: CreateCategoryInput): Promise<Category> {
        const existing = await this.db.categories().filterTitle(params.title).get();
        if (existing) {
            throw new Forbidden('Category with this title already exists');
        }

        const category = await this.db.categories().insert({
            id:          uuid(),
            title:       params.title,
            description: params.description,
            created_at:  new Date(),
        });

        return {
            id:          category.id,
            title:       category.title,
            description: category.description,
            created_at:  category.created_at,
            updated_at:  category.updated_at,
        };
    }

    async updateCategory(params: UpdateCategoryInput): Promise<Category> {
        const row = await this.db.categories().filterID(params.category_id).get();
        if (!row) {
            throw new NotFound('Category not found');
        }

        const patch: { title?: string | null; description?: string | null} = {};
        if (Object.prototype.hasOwnProperty.call(params, 'title'))       patch.title = params.title!;
        if (Object.prototype.hasOwnProperty.call(params, 'description')) patch.description = params.description;

        await this.db.categories().filterID(params.category_id).update(patch);

        const category = await this.db.categories().filterID(params.category_id).get();
        if (!category) {
            throw new NotFound('Category not found');
        }

        return {
            id:          category.id,
            title:       category.title,
            description: category.description,
            created_at:  category.created_at,
            updated_at:  category.updated_at,
        };
    }

    async getCategory(params: GetCategoryInput): Promise<Category> {
        const category = await this.db.categories().filterID(params.category_id).get();
        if (!category) {
            throw new NotFound('Category not found');
        }

        return category
    }

    async listCategories(params: ListCategoriesInput): Promise<CategoryList> {
        const rows = (await this.db.categories().page(params.limit, params.offset).select());
        const total = await this.db.categories().count();

        return {
            data: rows,
            pagination: {
                offset: params.offset,
                limit:  params.limit,
                total:  total,
            }
        };
    }

    async deleteCategory(params: DeleteCategoryInput): Promise<void> {
        const category = await this.db.categories().filterID(params.category_id).get();
        if (!category) {
            throw new NotFound('Category not found');
        }

        await this.db.transaction(async (transaction) => {
            await transaction.posts.filterCategory(params.category_id).delete();
            await transaction.categories.filterID(params.category_id).delete();
        })

        await this.db.categories().filterID(params.category_id).delete();
    }
}
