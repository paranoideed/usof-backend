import { Knex } from 'knex';

export type PostStatus = 'active' | 'inactive' | 'hidden';

export type PostRow = {
    id:      string;
    user_id: string;          // author
    title:   string;
    status:  PostStatus;

    content:  string;
    likes:    number;
    dislikes: number;

    created_at: Date;
    updated_at: Date | null;
};

export default class PostsQ {
    private builder: Knex.QueryBuilder<PostRow, PostRow[]>;
    private counter: Knex.QueryBuilder<PostRow, PostRow[]>;

    constructor(builder: Knex.QueryBuilder<PostRow, PostRow[]>) {
        this.builder = builder;
        this.counter = builder.clone();
    }

    async insert(params: {
        id:         string;
        user_id:    string;
        title:      string;
        content:    string;
        status:     PostStatus;
        created_at: Date;
    }): Promise<PostRow> {
        const data: PostRow = {
            id:         params.id,
            user_id:    params.user_id,
            title:      params.title,
            status:     params.status,
            content:    params.content,
            likes:      0,
            dislikes:   0,
            created_at: params.created_at,
            updated_at: null,
        };

        await this.builder.clone().insert(data);
        return data;
    }

    async get(): Promise<PostRow | null> {
        const row = await this.builder.clone().first();
        return row ?? null;
    }

    async select(): Promise<PostRow[]> {
        const rows = await this.builder.clone();
        return rows ?? [];
    }

    async update(set: {
        title?:     string;
        content?:   string;
        status?:    PostStatus;
        likes?:     number;
        dislikes?:  number;
        updated_at?: Date | null;
    }): Promise<void> {
        const setMap: Partial<PostRow> = {};

        if (Object.prototype.hasOwnProperty.call(set, 'title')) setMap.title = set.title!;
        if (Object.prototype.hasOwnProperty.call(set, 'content')) setMap.content = set.content!;
        if (Object.prototype.hasOwnProperty.call(set, 'status')) setMap.status = set.status!;
        if (Object.prototype.hasOwnProperty.call(set, 'likes')) setMap.likes = set.likes!;
        if (Object.prototype.hasOwnProperty.call(set, 'dislikes')) setMap.dislikes = set.dislikes!;

        if (Object.prototype.hasOwnProperty.call(set, 'updated_at')) {
            setMap.updated_at = set.updated_at ?? null;
        } else {
            setMap.updated_at = new Date();
        }

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

    filterUserID(userId: string): this {
        this.builder = this.builder.where('user_id', userId);
        this.counter = this.counter.where('user_id', userId);
        return this;
    }

    filterStatus(status: PostStatus | PostStatus[]): this {
        if (Array.isArray(status)) {
            this.builder = this.builder.whereIn('status', status);
            this.counter = this.counter.whereIn('status', status);
        } else {
            this.builder = this.builder.where('status', status);
            this.counter = this.counter.where('status', status);
        }
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

    filterCreatedTo(ts: Date): this {
        this.builder = this.builder.where('created_at', '<=', ts);
        this.counter = this.counter.where('created_at', '<=', ts);
        return this;
    }

    orderByCreatedAt(asc = false): this {
        this.builder = this.builder.orderBy('created_at', asc ? 'asc' : 'desc');
        return this;
    }

    orderByUpdatedAt(asc = false): this {
        this.builder = this.builder.orderBy('updated_at', asc ? 'asc' : 'desc');
        return this;
    }

    orderByLikes(asc = false): this {
        this.builder = this.builder.orderBy('likes', asc ? 'asc' : 'desc');
        return this;
    }

    orderByDislikes(asc = false): this {
        this.builder = this.builder.orderBy('dislikes', asc ? 'asc' : 'desc');
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