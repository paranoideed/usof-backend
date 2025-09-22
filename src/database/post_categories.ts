import { Knex } from 'knex';

export type PostCategoryRow = {
    post_id: string;
    category_id: string;
};

export default class PostCategoriesQ {
    private builder: Knex.QueryBuilder<PostCategoryRow, PostCategoryRow[]>;
    private counter: Knex.QueryBuilder<PostCategoryRow, PostCategoryRow[]>;

    constructor(builder: Knex.QueryBuilder<PostCategoryRow, PostCategoryRow[]>) {
        this.builder = builder;
        this.counter = builder.clone();
    }

    New(): PostCategoriesQ {
        return new PostCategoriesQ(this.builder.clone());
    }

    async insert(params: {
        post_id: string;
        category_id: string;
    }): Promise<PostCategoryRow> {
        const data: PostCategoryRow = {
            post_id: params.post_id,
            category_id: params.category_id,
        };

        await this.builder.clone().insert(data);
        return data;
    }

    async get(): Promise<PostCategoryRow | null> {
        const row = await this.builder.clone().first();
        return row ?? null;
    }

    async select(): Promise<PostCategoryRow[]> {
        const rows = await this.builder.clone();
        return rows ?? []
    }

    async delete(): Promise<void> {
        await this.builder.clone().del();
    }

    filterPostID(postId: string): this {
        this.builder = this.builder.where('post_id', postId);
        this.counter = this.counter.where('post_id', postId);
        return this;
    }

    filterCategoryID(categoryId: string): this {
        this.builder = this.builder.where('category_id', categoryId);
        this.counter = this.counter.where('category_id', categoryId);
        return this;
    }

    filterCategoryIDs(categoryIds: string[]): this {
        this.builder = this.builder.whereIn('category_id', categoryIds);
        this.counter = this.counter.whereIn('category_id', categoryIds);
        return this;
    }

    page(limit: number, offset = 0): this {
        this.builder = this.builder.limit(limit).offset(offset);
        return this;
    }

    async count(): Promise<number> {
        const row: any = await this.counter.clone().clearOrder?.().count({ cnt: '*' }).first();
        const val = row?.cnt ?? row?.['count(*)'] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}