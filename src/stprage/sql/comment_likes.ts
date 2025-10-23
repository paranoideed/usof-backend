import { Knex } from 'knex';

export type CommentLikeRow = {
    id:              string;
    comment_id:      string;
    author_id:       string;
    author_username: string;
    type:            'like' | 'dislike';
    created_at:      Date;
};

export default class CommentLikesQ {
    private builder: Knex.QueryBuilder<CommentLikeRow, CommentLikeRow[]>;
    private counter: Knex.QueryBuilder<CommentLikeRow, CommentLikeRow[]>;

    constructor(builder: Knex.QueryBuilder<CommentLikeRow, CommentLikeRow[]>) {
        this.builder = builder;
        this.counter = builder.clone();
    }

    async upsert(params: {
        id:              string;
        comment_id:      string;
        author_id:       string;
        author_username: string;
        type:            'like' | 'dislike';
        created_at:      Date;
    }): Promise<CommentLikeRow> {
        const data: CommentLikeRow = {
            id:              params.id,
            author_id:       params.author_id,
            author_username: params.author_username,
            comment_id:      params.comment_id,
            type:            params.type,
            created_at:      params.created_at,
        };

        await this.builder.clone().upsert(data)

        return data;
    }

    async get(): Promise<CommentLikeRow | null> {
        const row = await this.builder.clone().first();
        return row ?? null;
    }

    async select(): Promise<CommentLikeRow[]> {
        const rows = await this.builder.clone();
        return rows ?? []
    }

    async update(set: { type?:  'like' | 'dislike' }): Promise<void> {
        const setMap: Partial<CommentLikeRow> = {};
        if (Object.prototype.hasOwnProperty.call(set, 'type')) {
            setMap.type = set.type!;
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

    filterCommentID(commentId: string): this {
        this.builder = this.builder.where('comment_id', commentId);
        this.counter = this.counter.where('comment_id', commentId);
        return this;
    }

    filterAuthorID(authorId: string): this {
        this.builder = this.builder.where('author_id', authorId);
        this.counter = this.counter.where('author_id', authorId);
        return this;
    }

    filterUsername(username: string): this {
        this.builder = this.builder.where('author_username', username);
        this.counter = this.counter.where('author_username', username);
        return this;
    }

    filterType(type: string): this {
        this.builder = this.builder.where('type', type);
        this.counter = this.counter.where('type', type);
        return this;
    }

    orderByCreatedAt(asc = false): this {
        this.builder = this.builder.orderBy('created_at', asc ? 'asc' : 'desc');
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