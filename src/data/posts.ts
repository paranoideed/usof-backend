import { Knex } from 'knex';
import { CategoryRow } from "./categories";

export type PostStatus = 'active' | 'inactive' | 'hidden';

export type PostRow = {
    id:              string;
    author_id:       string;
    author_username: string;
    title:           string;
    status:          PostStatus;
    content:         string;
    likes:           number;
    dislikes:        number;
    created_at:      Date;
    updated_at:      Date | null;
};

export type PostWithDetails = {
    data:          PostRow;
    categories:    CategoryRow[];
    user_reaction: string | null;
};

export default class PostsQ {
    private builder: Knex.QueryBuilder<PostRow, PostRow[]>;
    private counter: Knex.QueryBuilder<PostRow, PostRow[]>;

    // единый алиас базовой таблицы
    private readonly alias = 'p';
    private C = (col: string) => `${this.alias}.${col}`;

    constructor(builder: Knex.QueryBuilder<PostRow, PostRow[]>) {
        // насильно задаём алиас базовой таблице и клонируем для counter
        this.builder = builder.clone().from({ [this.alias]: 'posts' });
        this.counter = builder.clone().from({ [this.alias]: 'posts' });
    }

    async insert(params: {
        id:              string;
        author_id:       string;
        author_username: string;
        title:           string;
        content:         string;
        status:          PostStatus;
        created_at:      Date;
    }): Promise<PostRow> {
        const data: PostRow = {
            id:              params.id,
            author_id:       params.author_id,
            author_username: params.author_username,
            title:           params.title,
            status:          params.status,
            content:         params.content,
            likes:           0,
            dislikes:        0,
            created_at:      params.created_at,
            updated_at:      null,
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

    async getWithDetails(userId: string | null | undefined): Promise<PostWithDetails | null> {
        const client = this.builder.client;
        const hasUser = Boolean(userId);

        const catsSub = this.builder.client!
            .queryBuilder()
            .from({ pc: 'post_categories' })
            .innerJoin({ c: 'categories' }, 'c.id', 'pc.category_id')
            .select('pc.post_id')
            .select(client.raw(
                "JSON_ARRAYAGG(JSON_OBJECT(" +
                "'id', c.id," +
                "'title', c.title," +
                "'description', c.description," +
                "'created_at', c.created_at," +
                "'updated_at', c.updated_at" +
                ")) AS categories_json"
            ))
            .groupBy('pc.post_id');

        let q = this.builder.clone()
            .leftJoin({ cats: catsSub as any }, 'cats.post_id', this.C('id'));

        if (hasUser) {
            const uid = String(userId);
            const raw = client.raw('l_me.author_id = ?', [uid]);
            q = q.leftJoin({ l_me: 'post_likes' }, function () {
                // this: JoinClause — используем алиас 'p'
                this.on('l_me.post_id', '=', 'p.id')
                    .on(raw); // добавляем условие по author_id
            });
        }

        const row = await q
            .clearSelect()
            .select([
                this.C('id'),
                this.C('author_id'),
                this.C('author_username'),
                this.C('title'),
                this.C('status'),
                this.C('content'),
                this.C('likes'),
                this.C('dislikes'),
                this.C('created_at'),
                this.C('updated_at'),
                hasUser ? client.raw('l_me.type AS user_reaction') : client.raw('NULL AS user_reaction'),
                client.raw('cats.categories_json AS categories_json'),
            ])
            .first();

        if (!row) return null;

        const data: PostRow = {
            id: (row as any).id,
            author_id: (row as any).author_id,
            author_username: (row as any).author_username,
            title: (row as any).title,
            status: (row as any).status,
            content: (row as any).content,
            likes: (row as any).likes,
            dislikes: (row as any).dislikes,
            created_at: (row as any).created_at,
            updated_at: (row as any).updated_at,
        };

        const categories = parseCategoriesJson((row as any).categories_json);
        const user_reaction = hasUser ? ((row as any).user_reaction ?? null) : null;

        return { data, categories, user_reaction };
    }

    async selectWithDetails(userId: string | null | undefined): Promise<PostWithDetails[]> {
        const client = this.builder.client;
        const hasUser = Boolean(userId);

        const catsSub = this.builder.client!
            .queryBuilder()
            .from({ pc: 'post_categories' })
            .innerJoin({ c: 'categories' }, 'c.id', 'pc.category_id')
            .select('pc.post_id')
            .select(client.raw(
                "JSON_ARRAYAGG(JSON_OBJECT(" +
                "'id', c.id," +
                "'title', c.title," +
                "'description', c.description," +
                "'created_at', c.created_at," +
                "'updated_at', c.updated_at" +
                ")) AS categories_json"
            ))
            .groupBy('pc.post_id');

        let q = this.builder.clone()
            .leftJoin({ cats: catsSub as any }, 'cats.post_id', this.C('id'));

        if (hasUser) {
            const uid = String(userId);
            const raw = client.raw('l_me.author_id = ?', [uid]);
            q = q.leftJoin({ l_me: 'post_likes' }, function () {
                this.on('l_me.post_id', '=', 'p.id')
                    .on(raw);
            });
        }

        const rows = await q
            .clearSelect()
            .select([
                this.C('id'),
                this.C('author_id'),
                this.C('author_username'),
                this.C('title'),
                this.C('status'),
                this.C('content'),
                this.C('likes'),
                this.C('dislikes'),
                this.C('created_at'),
                this.C('updated_at'),
                hasUser ? client.raw('l_me.type AS user_reaction') : client.raw('NULL AS user_reaction'),
                client.raw('cats.categories_json AS categories_json'),
            ]);

        return (rows ?? []).map((row: any) => {
            const data: PostRow = {
                id: row.id,
                author_id: row.author_id,
                author_username: row.author_username,
                title: row.title,
                status: row.status,
                content: row.content,
                likes: row.likes,
                dislikes: row.dislikes,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
            const categories = parseCategoriesJson(row.categories_json);
            const user_reaction = hasUser ? (row.user_reaction ?? null) : null;

            return { data, categories, user_reaction };
        });
    }

    async update(set: {
        title?:      string;
        content?:    string;
        status?:     PostStatus;
        likes?:      number;
        dislikes?:   number;
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

    // -------- ФИЛЬТРЫ (без 'posts.'; всё через алиас p) --------
    filterID(id: string): this {
        this.builder = this.builder.where(this.C('id'), id);
        this.counter = this.counter.where(this.C('id'), id);
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

    filterStatus(status: PostStatus | PostStatus[]): this {
        if (Array.isArray(status)) {
            this.builder = this.builder.whereIn(this.C('status'), status);
            this.counter = this.counter.whereIn(this.C('status'), status);
        } else {
            this.builder = this.builder.where(this.C('status'), status);
            this.counter = this.counter.where(this.C('status'), status);
        }
        return this;
    }

    filterCategoriesAny(categoryIds: string[]): this {
        this.builder = this.builder.whereExists((qb) =>
            qb.select(this.builder.client.raw('1'))
                .from('post_categories as pc')
                .whereRaw('pc.post_id = ??', [this.C('id')])
                .whereIn('pc.category_id', categoryIds)
        );
        this.counter = this.counter.whereExists((qb) =>
            qb.select(this.counter.client.raw('1'))
                .from('post_categories as pc')
                .whereRaw('pc.post_id = ??', [this.C('id')])
                .whereIn('pc.category_id', categoryIds)
        );
        return this;
    }

    filterCategoriesAll(categoryIds: string[]): this {
        const sub = this.builder.client!.queryBuilder()
            .from('post_categories as pc')
            .select('pc.post_id')
            .whereIn('pc.category_id', categoryIds)
            .groupBy('pc.post_id')
            .havingRaw('count(distinct pc.category_id) = ?', [categoryIds.length]);

        this.builder = this.builder.whereIn(this.C('id'), sub.clone());
        this.counter = this.counter.whereIn(this.C('id'), sub.clone());
        return this;
    }

    filterUserLike(type: 'like' | 'dislike' | 'none', userId: string): this {
        const client = this.builder.client;

        if (type === 'none') {
            this.builder = this.builder.whereNotExists((qb) =>
                qb.select(client.raw('1'))
                    .from('post_likes as pl')
                    .whereRaw('pl.post_id = ??', [this.C('id')])
                    .andWhere('pl.author_id', userId)
            );
            this.counter = this.counter.whereNotExists((qb) =>
                qb.select(client.raw('1'))
                    .from('post_likes as pl')
                    .whereRaw('pl.post_id = ??', [this.C('id')])
                    .andWhere('pl.author_id', userId)
            );
        } else {
            this.builder = this.builder.whereExists((qb) =>
                qb.select(client.raw('1'))
                    .from('post_likes as pl')
                    .whereRaw('pl.post_id = ??', [this.C('id')])
                    .andWhere('pl.author_id', userId)
                    .andWhere('pl.type', type)
            );
            this.counter = this.counter.whereExists((qb) =>
                qb.select(client.raw('1'))
                    .from('post_likes as pl')
                    .whereRaw('pl.post_id = ??', [this.C('id')])
                    .andWhere('pl.author_id', userId)
                    .andWhere('pl.type', type)
            );
        }
        return this;
    }

    filterTitleLike(substr: string): this {
        const v = `%${substr}%`;
        this.builder = this.builder.where(this.C('title'), 'like', v);
        this.counter = this.counter.where(this.C('title'), 'like', v);
        return this;
    }

    filterCreatedFrom(ts: Date): this {
        this.builder = this.builder.where(this.C('created_at'), '>=', ts);
        this.counter = this.counter.where(this.C('created_at'), '>=', ts);
        return this;
    }

    filterCreatedTo(ts: Date): this {
        this.builder = this.builder.where(this.C('created_at'), '<=', ts);
        this.counter = this.counter.where(this.C('created_at'), '<=', ts);
        return this;
    }

    // -------- СОРТИРОВКИ --------
    orderByRating(asc = false): this {
        this.builder = this.builder.orderByRaw(
            `\`${this.alias}\`.\`likes\` - \`${this.alias}\`.\`dislikes\` ${asc ? 'asc' : 'desc'}`
        );
        return this;
    }

    orderByCreatedAt(asc = false): this {
        this.builder = this.builder.orderBy(this.C('created_at'), asc ? 'asc' : 'desc');
        return this;
    }

    orderByUpdatedAt(asc = false): this {
        this.builder = this.builder.orderBy(this.C('updated_at'), asc ? 'asc' : 'desc');
        return this;
    }

    orderByLikes(asc = false): this {
        this.builder = this.builder.orderBy(this.C('likes'), asc ? 'asc' : 'desc');
        return this;
    }

    orderByDislikes(asc = false): this {
        this.builder = this.builder.orderBy(this.C('dislikes'), asc ? 'asc' : 'desc');
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

function parseCategoriesJson(raw: any): CategoryRow[] {
    if (!raw) return [];
    try {
        const arr = JSON.parse(raw);
        return (arr as any[]).map((c) => ({
            id: String(c.id),
            title: String(c.title),
            description: c.description == null ? "" : String(c.description),
            created_at: new Date(c.created_at),
            updated_at: c.updated_at ? new Date(c.updated_at) : null,
        }));
    } catch {
        return [];
    }
}
