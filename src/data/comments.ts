import { Knex } from 'knex';

export type CommentRow = {
    id:              string;
    post_id:         string;
    author_id:       string;
    author_username: string;
    parent_id:       string | null;

    content:  string;
    likes:    number;
    dislikes: number;

    created_at: Date;
    updated_at: Date | null;
};

export type CommentWithDetails = {
    data:          CommentRow;
    user_reaction: string | null;
};

export default class CommentsQ {
    private builder: Knex.QueryBuilder<CommentRow, CommentRow[]>;
    private counter: Knex.QueryBuilder<CommentRow, CommentRow[]>;

    constructor(builder: Knex.QueryBuilder<CommentRow, CommentRow[]>) {
        this.builder = builder;
        this.counter = builder.clone();
    }

    async insert(params: {
        id:              string;
        post_id:         string;
        author_id:       string;
        author_username: string;
        parent_id?:      string | null;
        content:         string;
        created_at:      Date;
    }): Promise<CommentRow> {
        const data: CommentRow = {
            id:              params.id,
            post_id:         params.post_id,
            author_id:       params.author_id,
            author_username: params.author_username,
            parent_id:       params.parent_id ?? null,
            content:         params.content,
            likes:           0,
            dislikes:        0,
            created_at:      params.created_at,
            updated_at:      null,
        };

        await this.builder.clone().insert(data);
        return data;
    }

    async get(): Promise<CommentRow | null> {
        const row = await this.builder.clone().first();
        return row ?? null;
    }

    async select(): Promise<CommentRow[]> {
        const rows = await this.builder.clone();
        return rows ?? [];
    }

    async getWithDetails(userId: string | null | undefined): Promise<CommentWithDetails | null> {
        const kx = this.builder.client!;
        const hasUser = Boolean(userId);

        let q = this.builder.clone();

        if (hasUser) {
            q = q.leftJoin({ l_me: 'comment_likes' }, function () {
                // @ts-ignore
                this.on('l_me.comment_id', '=', 'comments.id')
                    .andOn('l_me.author_id', '=', (this as any).client.raw('?', [userId]));
            });
        }

        const row = await q
            .clearSelect()
            .select([
                'comments.id',
                'comments.post_id',
                'comments.author_id',
                'comments.author_username',
                'comments.parent_id',
                'comments.content',
                'comments.likes',
                'comments.dislikes',
                'comments.created_at',
                'comments.updated_at',
                hasUser ? kx.raw('l_me.type AS user_reaction') : kx.raw('NULL AS user_reaction'),
            ])
            .first();

        if (!row) return null;

        const data: CommentRow = {
            id: row.id,
            post_id: row.post_id,
            author_id: row.author_id,
            author_username: row.author_username,
            parent_id: row.parent_id,
            content: row.content,
            likes: row.likes,
            dislikes: row.dislikes,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };

        return {
            data,
            user_reaction: hasUser ? ((row as any).user_reaction ?? null) : null,
        };
    }

    async selectWithDetails(userId: string | null | undefined): Promise<CommentWithDetails[]> {
        const kx = this.builder.client!;
        const hasUser = Boolean(userId);

        let q = this.builder.clone();

        if (hasUser) {
            q = q.leftJoin({ l_me: 'comment_likes' }, function () {
                // @ts-ignore
                this.on('l_me.comment_id', '=', 'comments.id')
                    .andOn('l_me.author_id', '=', (this as any).client.raw('?', [userId]));
            });
        }

        const rows = await q
            .clearSelect()
            .select([
                'comments.id',
                'comments.post_id',
                'comments.author_id',
                'comments.author_username',
                'comments.parent_id',
                'comments.content',
                'comments.likes',
                'comments.dislikes',
                'comments.created_at',
                'comments.updated_at',
                hasUser ? kx.raw('l_me.type AS user_reaction') : kx.raw('NULL AS user_reaction'),
            ]);

        return (rows ?? []).map((row) => ({
            data: {
                id: row.id,
                post_id: row.post_id,
                author_id: row.author_id,
                author_username: row.author_username,
                parent_id: row.parent_id,
                content: row.content,
                likes: row.likes,
                dislikes: row.dislikes,
                created_at: row.created_at,
                updated_at: row.updated_at,
            },
            user_reaction: hasUser ? ((row as any).user_reaction ?? null) : null,
        }));
    }

    async update(set: {
        content?:    string;
        likes?:      number;
        dislikes?:   number;
        updated_at?: Date;
    }): Promise<void> {
        const setMap: Partial<CommentRow> = {};

        if (Object.prototype.hasOwnProperty.call(set, 'content')) {
            setMap.content = set.content!;
        }

        if (Object.prototype.hasOwnProperty.call(set, 'likes')) {
            setMap.likes = set.likes!;
        }

        if (Object.prototype.hasOwnProperty.call(set, 'dislikes')) {
            setMap.dislikes = set.dislikes!;
        }

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

    filterPostID(postId: string): this {
        this.builder = this.builder.where('post_id', postId);
        this.counter = this.counter.where('post_id', postId);
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

    filterParentID(parentId: string | null): this {
        if (parentId === null) {
            this.builder = this.builder.whereNull('parent_id');
            this.counter = this.counter.whereNull('parent_id');
        } else {
            this.builder = this.builder.where('parent_id', parentId);
            this.counter = this.counter.where('parent_id', parentId);
        }
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
