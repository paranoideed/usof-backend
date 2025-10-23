import { Knex } from 'knex';

export type CategoryRow = {
    id:          string;
    title:       string;
    description: string;
    created_at:  Date;
    updated_at:  Date | null;
};

export default class CategoriesQ {
    private builder: Knex.QueryBuilder<CategoryRow, CategoryRow[]>;
    private counter: Knex.QueryBuilder<CategoryRow, CategoryRow[]>;

    constructor(builder: Knex.QueryBuilder<CategoryRow, CategoryRow[]>) {
        this.builder = builder;
        this.counter = builder.clone();
    }

    async insert(params: {
            id:          string;
            title:       string;
            description: string;
            created_at:  Date;
        }): Promise<CategoryRow> {
        const data: CategoryRow = {
            id:          params.id,
            title:       params.title,
            description: params.description,
            created_at:  params.created_at ?? new Date(),
            updated_at:  null,
        };

        await this.builder.clone().insert(data);
        return data;
    }

    async get(): Promise<CategoryRow | null> {
        const row = await this.builder.clone().first();
        return row ?? null;
    }

    async select(): Promise<CategoryRow[]> {
        const rows = await this.builder.clone();
        return rows ?? [];
    }

    async update(params: {
        title?:      string | null;
        description?: string | null;
    }): Promise<void> {
        const setMap: Partial<CategoryRow> = {};
        if (Object.prototype.hasOwnProperty.call(params, 'title')) {
            setMap.title = params.title!;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'description')) {
            setMap.description = params.description!;
        }

        setMap.updated_at = new Date();

        await this.builder.clone().update(setMap);
    }

    async delete(): Promise<void> {
        await this.builder.clone().del();
    }

    filterID(id: string): this {
        this.builder = this.builder.where('id', id);
        this.counter = this.counter.where('id', id);
        return this;
    }

    filterTitle(title: string): this {
        this.builder = this.builder.where('title', title);
        this.counter = this.counter.where('title', title);
        return this;
    }

    filterTitleLike(substr: string): this {
        const v = `%${substr}%`;
        this.builder = this.builder.where('title', 'like', v);
        this.counter = this.counter.where('title', 'like', v);
        return this;
    }

    filterCreatedFrom(ts: Date): this {
        this.builder = this.builder.where('created_at', '>=', ts);
        this.counter = this.counter.where('created_at', '>=', ts);
        return this;
    }

    orderByCreatedAt(asc = true): this {
        this.builder = this.builder.orderBy('created_at', asc ? 'asc' : 'desc');
        return this;
    }

    orderByTitle(asc = true): this {
        this.builder = this.builder.orderBy('title', asc ? 'asc' : 'desc');
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
