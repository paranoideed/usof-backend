import {Category, CategoryList} from "./category.domain";

export type CategoryResponse = {
    data: CategoryDataResponse
}

export type CategoryDataResponse = {
    id: string;
    type: "category"
    attributes: {
        title:        string;
        description: string | null;
        created_at:  Date;
        updated_at:  Date | null;
    }
}

export function categoryResponse(input: Category): CategoryResponse {
    return {
        data: {
            id: input.id,
            type: "category",
            attributes: {
                title:        input.title,
                description: input.description,
                created_at:  input.created_at,
                updated_at:  input.updated_at,
            }
        }
    };
}

export type CategoriesListResponse = {
    data: {
        id: string;
        type: "category"
        attributes: {
            title:        string;
            description: string | null;
            created_at:  Date;
            updated_at:  Date | null;
        }
    }[];
    meta: {
        total:  number;
        limit:  number;
        offset: number;
    }
}

export function categoryListResponse(items: CategoryList): CategoriesListResponse {
    return {
        data: items.data.map((input) => ({
            id: input.id,
            type: "category",
            attributes: {
                title:        input.title,
                description: input.description,
                created_at:  input.created_at,
                updated_at:  input.updated_at,
            }
        })),
        meta: {
            total:  items.pagination.total,
            limit:  items.pagination.limit,
            offset: items.pagination.offset,
        }
    };
}