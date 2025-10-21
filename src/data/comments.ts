import { Knex } from 'knex';

export type CommentRow = {
    id:              string;
    post_id:         string;
    author_id:       string;
    author_username: string;
    parent_id:       string | null;

    replies_count:   number; // <-- NEW

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

    private readonly alias = 'c';
    private C = (col: string) => `${this.alias}.${col}`;

    constructor(builder: Knex.QueryBuilder<CommentRow, CommentRow[]>) {
        this.builder = builder.clone().from({ [this.alias]: 'comments' });
        this.counter = builder.clone().from({ [this.alias]: 'comments' });
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

            replies_count:   0, // <-- DB всё равно дефолтнёт, но оставим для явности

            content:         params.content,
            likes:           0,
            dislikes:        0,
            created_at:      params.created_at,
            updated_at:      null,
        };

        await this.builder.client!.queryBuilder().table('comments').insert(data);
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

    async update(set: {
        content?:    string;
        likes?:      number;
        dislikes?:   number;
        updated_at?: Date | null;
        replies_count?: number;
    }): Promise<void> {
        const setMap: Partial<CommentRow> = {};

        if (Object.prototype.hasOwnProperty.call(set, 'content'))   setMap.content = set.content!;
        if (Object.prototype.hasOwnProperty.call(set, 'likes'))     setMap.likes = set.likes!;
        if (Object.prototype.hasOwnProperty.call(set, 'dislikes'))  setMap.dislikes = set.dislikes!;
        if (Object.prototype.hasOwnProperty.call(set, 'replies_count')) setMap.replies_count = set.replies_count!;
        if (Object.prototype.hasOwnProperty.call(set, 'updated_at')) {
            setMap.updated_at = set.updated_at ?? null;
        } else {
            setMap.updated_at = new Date();
        }

        await this.builder.clone().update(setMap);
    }

    async addReplies(): Promise<void> {
        await this.builder.clone().update({
            replies_count: (this.builder.client as any).raw('?? + ?', ['replies_count', 1]),
            updated_at: new Date(),
        });
    }

    async removeReplies(): Promise<void> {
        await this.builder.clone().update({
            replies_count: (this.builder.client as any).raw('GREATEST(?? - ?, 0)', ['replies_count', Math.max(1, -1)]),
            updated_at: new Date(),
        });
    }

    async delete(): Promise<void> {
        await this.builder.clone().del();
    }

    async getWithDetails(userId: string | null | undefined): Promise<CommentWithDetails | null> {
        const client = this.builder.client!;
        const uid = String(userId ?? '').trim();
        const hasUser = uid.length > 0;

        let q = this.builder.clone();

        if (hasUser) {
            q = q.leftJoin({ l_me: 'comment_likes' }, function () {
                this.on('l_me.comment_id', '=', 'c.id')
                    .on('l_me.author_id', '=', client.raw('?', [uid]));
            });
        }

        const cols: any[] = [
            this.C('id'),
            this.C('post_id'),
            this.C('author_id'),
            this.C('author_username'),
            this.C('parent_id'),
            this.C('replies_count'), // <-- NEW
            this.C('content'),
            this.C('likes'),
            this.C('dislikes'),
            this.C('created_at'),
            this.C('updated_at'),
            hasUser ? client.raw('`l_me`.`type` AS user_reaction')
                : client.raw('NULL AS user_reaction'),
        ];

        const row: any = await q.clearSelect().select(cols).first();
        if (!row) return null;

        const data: CommentRow = {
            id: row.id,
            post_id: row.post_id,
            author_id: row.author_id,
            author_username: row.author_username,
            parent_id: row.parent_id,

            replies_count: row.replies_count, // <-- NEW

            content: row.content,
            likes: row.likes,
            dislikes: row.dislikes,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };

        return { data, user_reaction: hasUser ? (row.user_reaction ?? null) : null };
    }

    async selectWithDetails(userId: string | null | undefined): Promise<CommentWithDetails[]> {
        const client = this.builder.client!;
        const hasUser = Boolean(userId);

        let q = this.builder.clone();

        if (hasUser) {
            const uid = String(userId);
            const raw = client.raw('l_me.author_id = ?', [uid]);

            q = q.leftJoin({ l_me: 'comment_likes' }, function () {
                this.on('l_me.comment_id', '=', 'c.id')
                    .on(raw);
            });
        }

        const cols: any[] = [
            this.C('id'),
            this.C('post_id'),
            this.C('author_id'),
            this.C('author_username'),
            this.C('parent_id'),
            this.C('replies_count'), // <-- NEW
            this.C('content'),
            this.C('likes'),
            this.C('dislikes'),
            this.C('created_at'),
            this.C('updated_at'),
            hasUser ? client.raw('l_me.type AS user_reaction')
                : client.raw('NULL AS user_reaction'),
        ];

        const rows: any[] = await q.clearSelect().select(cols);

        return (rows ?? []).map((row) => ({
            data: {
                id: row.id,
                post_id: row.post_id,
                author_id: row.author_id,
                author_username: row.author_username,
                parent_id: row.parent_id,

                replies_count: row.replies_count, // <-- NEW

                content: row.content,
                likes: row.likes,
                dislikes: row.dislikes,
                created_at: row.created_at,
                updated_at: row.updated_at,
            },
            user_reaction: hasUser ? (row.user_reaction ?? null) : null,
        }));
    }

    // ---- фильтры/сортировки ----
    filterID(id: string): this {
        this.builder = this.builder.where(this.C('id'), id);
        this.counter = this.counter.where(this.C('id'), id);
        return this;
    }

    filterPostID(postId: string): this {
        this.builder = this.builder.where(this.C('post_id'), postId);
        this.counter = this.counter.where(this.C('post_id'), postId);
        return this;
    }

    filterAuthorID(authorId: string): this {
        this.builder = this.builder.where(this.C('author_id'), authorId);
        this.counter = this.counter.where(this.C('author_id'), authorId);
        return this;
    }

    filterUsername(username: string): this {
        this.builder = this.builder.where(this.C('author_username'), username);
        this.counter = this.counter.where(this.C('author_username'), username);
        return this;
    }

    filterParentID(parentId: string | null): this {
        if (parentId === null) {
            this.builder = this.builder.whereNull(this.C('parent_id'));
            this.counter = this.counter.whereNull(this.C('parent_id'));
        } else {
            this.builder = this.builder.where(this.C('parent_id'), parentId);
            this.counter = this.counter.where(this.C('parent_id'), parentId);
        }
        return this;
    }

    orderByCreatedAt(asc = false): this {
        this.builder = this.builder.orderBy(this.C('created_at'), asc ? 'asc' : 'desc');
        return this;
    }

    orderByRating(asc = false): this {
        const dir = asc ? 'asc' : 'desc';
        this.builder = this.builder.orderByRaw(
            `\`${this.alias}\`.\`likes\` - \`${this.alias}\`.\`dislikes\` ${dir}`
        );
        this.counter = this.counter.orderByRaw(
            `\`${this.alias}\`.\`likes\` - \`${this.alias}\`.\`dislikes\` ${dir}`
        );
        return this;
    }

    // при желании — сортировка по количеству прямых ответов
    orderByReplies(asc = false): this {
        this.builder = this.builder.orderBy(this.C('replies_count'), asc ? 'asc' : 'desc');
        return this;
    }

    page(limit: number, offset = 0): this {
        this.builder = this.builder.limit(limit).offset(offset);
        return this;
    }

    async count(): Promise<number> {
        const row: any = await (this.counter.clone() as any).clearOrder?.().count({ cnt: '*' }).first();
        const val = row?.cnt ?? row?.['count(*)'] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}
