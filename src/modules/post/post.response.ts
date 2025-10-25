import {Category} from "../category/category.domain";
import {Post, PostLikesList, PostsList} from "./post.domain";
import {CategoryDataResponse} from "../category/category.response";

export type PostResponse = {
    data: {
        id: string;
        type: "post"
        attributes: {
            author_id:          string;
            author_username:    string;
            author_avatar_url:  string | null;

            title:              string;
            status:             string;
            content:            string;

            likes:              number;
            dislikes:           number;

            categories:         CategoryDataResponse[];
            user_reaction:      string | null;

            created_at:         Date;
            updated_at:         Date | null;
        }
    }
}

export function postResponse(input: Post): PostResponse {
    const transformedCategories: CategoryDataResponse[] = input.categories.map(cat => ({
        id:   cat.id,
        type: "category",
        attributes: {
            title:       cat.title,
            description: cat.description,
            created_at:  cat.created_at,
            updated_at:  cat.updated_at,
        }
    }));

    const resp: PostResponse = {
        data: {
            id: input.id,
            type: "post",
            attributes: {
                author_id:          input.author_id,
                author_username:    input.author_username,
                author_avatar_url:  input.author_avatar_url,

                title:              input.title,
                status:             input.status,
                content:            input.content,

                likes:              input.likes,
                dislikes:           input.dislikes,

                categories:         transformedCategories,
                user_reaction:      input.user_reaction,

                created_at:         input.created_at,
                updated_at:         input.updated_at,
            }
        }
    };

    return resp;
}

export type PostsListResponse = {
    data: {
        id: string;
        type: "post"
        attributes: {
            author_id:          string;
            author_username:    string;
            author_avatar_url:  string | null;

            title:              string;
            status:             string;
            content:            string;

            likes:              number;
            dislikes:           number;

            categories:         CategoryDataResponse[];
            user_reaction:      string | null;

            created_at:         Date;
            updated_at:         Date | null;
        }
    }[];
    pagination: {
        offset: number;
        limit:  number;
        total:  number;
    };
}

export function postListResponse(input: PostsList): PostsListResponse {
    const transformedData = input.posts.map((item) => {
        const transformedCategories: CategoryDataResponse[] = item.categories.map(cat => ({
            id:   cat.id,
            type: "category",
            attributes: {
                title:       cat.title,
                description: cat.description,
                created_at:  cat.created_at,
                updated_at:  cat.updated_at,
            }
        }));

        return {
            id: item.id,
            type: "post" as const,
            attributes: {
                author_id:          item.author_id,
                author_username:    item.author_username,
                author_avatar_url:  item.author_avatar_url,

                title:              item.title,
                status:             item.status,
                content:            item.content,

                likes:              item.likes,
                dislikes:           item.dislikes,

                categories:         transformedCategories,
                user_reaction:      item.user_reaction,

                created_at:         item.created_at,
                updated_at:         item.updated_at,
            }
        };
    });

    return {
        data: transformedData,
        pagination: {
            offset: input.pagination.offset,
            limit:  input.pagination.limit,
            total:  input.pagination.total,
        }
    };
}
export type postLikeListResponse = {
    data: {
        id: string;
        type: "like"
        attributes: {
            like_id:         string;
            author_id:       string;
            author_username: string;
            type:            'like' | 'dislike';
            created_at:      Date;
        }
    }[];
    pagination: {
        offset: number;
        limit:  number;
        total:  number;
    };
}

export async function postLikeListResponse(input: PostLikesList): Promise<postLikeListResponse> {
    return {
        data: input.data.map((item) => ({
            id: item.id,
            type: "like",
            attributes: {
                like_id:         item.id,
                author_id:       item.author_id,
                author_username: item.author_username,
                type:            item.type,
                created_at:      item.created_at,
            }
        })),
        pagination: {
            offset: input.pagination.offset,
            limit:  input.pagination.limit,
            total:  input.pagination.total,
        }
    };
}