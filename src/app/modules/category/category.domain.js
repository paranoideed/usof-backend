import {Database} from "../../../database/database.js";
import { v4 as uuid } from 'uuid';
import {CategoryAlreadyExist, CategoryNotFoundError} from "./category.errors.js";

export default class UserDomain {
    constructor(config) {
        this.db = new Database(config);
    }

    async createCategory(title, description) {
        title = String(title).trim();
        description = String(description).trim();

        const existingCategory = await this.db.categories().filterTitle(title).get();
        if (existingCategory) {
            throw new CategoryAlreadyExist('Category with this title already exists');
        }
        const id = uuid()

        const newCategory = {
            id: id,
            title: title,
            createdAt: new Date(),
        };

        await this.db.categories().insert(newCategory);
    }

    async getCategoryByID(id) {
        const category = await this.db.categories().filterID(id).get();
        if (!category) {
            throw new CategoryNotFoundError('Category not found');
        }
        return categoryFormat(category);
    }

    async listCategories({ limit = 10, offset = 0 }) {
        const categories = await this.db.categories().page(limit, offset).select();
        const total = await this.db.categories().count();
        return {
            categories: categories.map(categoryFormat),
            total: total,
        };
    }

    async deleteCategoryByID(id) {
        const category = await this.db.categories().filterID(id).get();
        if (!category) {
            throw new CategoryNotFoundError('Category not found');
        }

        await this.db.categories().filterID(id).delete();
    }
}

function categoryFormat(category) {
    return {
        id:          category.id,
        name:        category.title,
        description: category.description,
        updatedAt:   category.updatedAt,
        createdAt:   category.createdAt,
    };
}

function categoriesList(categories, {limit, offset, total}) {
    let c = categories.map(categoryFormat);
    return {
        categories: c,
        total:      total,
        limit:      limit,
        offset:     offset,
    };
}