import { Knex } from 'knex';
import { CategoryRow } from "./categories";

export type PostStatus = 'active' | 'closed';
export type UserReaction = 'like' | 'dislike' | null;

export type PostRow = {
    id:                 string;
    author_id:          string;
    author_username:    string;
    author_avatar_url:  string;
    title:              string;
    status:             PostStatus;
    content:            string;
    likes:              number;
    dislikes:           number;
    user_reaction:      UserReaction;
    categories:         CategoryRow[];
    created_at:         Date;
    updated_at:         Date | null;
};

export default class PostsQ {
    private builder: Knex.QueryBuilder<PostRow, PostRow[]>;
    private counter: Knex.QueryBuilder<PostRow, PostRow[]>;
    private readonly alias = 'p';
    private C = (col: string) => `${this.alias}.${col}`;

    constructor(builder: Knex.QueryBuilder<PostRow, PostRow[]>) {
        this.builder = builder.clone().from({ [this.alias]: 'posts' });
        this.counter = builder.clone().from({ [this.alias]: 'posts' });
    }

    async insert(params: {
        id:         string;
        author_id:  string;
        title:      string;
        content:    string;
        status:     PostStatus;
        created_at: Date;
    }): Promise<PostRow> {
        const dataDb = {
            id:         params.id,
            author_id:  params.author_id,
            title:      params.title,
            status:     params.status,
            content:    params.content,
            likes:      0,
            dislikes:   0,
            created_at: params.created_at,
            updated_at: null as Date | null,
        };
        await this.builder.client!.queryBuilder().table('posts').insert(dataDb);

        // Возвращаем плоский объект с виртуальными полями-заглушками
        const data: PostRow = {
            ...dataDb,
            author_username:   '',
            author_avatar_url: '',
            user_reaction:     null,
            categories:        [],
        };
        return data;
    }

    async update(set: {
        title?:      string;
        content?:    string;
        status?:     PostStatus;
        likes?:      number;
        dislikes?:   number;
        updated_at?: Date | null;
    }): Promise<void> {
        const setMap: any = {};
        if (Object.prototype.hasOwnProperty.call(set, 'title'))    setMap.title = set.title!;
        if (Object.prototype.hasOwnProperty.call(set, 'content'))  setMap.content = set.content!;
        if (Object.prototype.hasOwnProperty.call(set, 'status'))   setMap.status = set.status!;
        if (Object.prototype.hasOwnProperty.call(set, 'likes'))    setMap.likes = set.likes!;
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

    // ----- READ ONE: возвращаем PostRow -----
    async get(userId: string | null | undefined): Promise<PostRow | null> {
        const client  = this.builder.client!;
        const hasUser = Boolean(userId);

        const catsSub = client
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

        let q = this.builder
            .clone()
            .leftJoin({ cats: catsSub as any }, 'cats.post_id', this.C('id'))
            .leftJoin({ u: 'users' }, 'u.id', this.C('author_id'));

        if (hasUser) {
            const uid = String(userId);
            const raw = client.raw('l_me.author_id = ?', [uid]);
            q = q.leftJoin({ l_me: 'post_likes' }, function () {
                this.on('l_me.post_id', '=', 'p.id').on(raw);
            });
        }

        const row: any = await q
            .clearSelect()
            .select([
                this.C('id'),
                this.C('author_id'),
                client.raw('u.username AS author_username'),
                client.raw('u.avatar_url AS author_avatar_url'),
                this.C('title'),
                this.C('status'),
                this.C('content'),
                this.C('likes'),
                this.C('dislikes'),
                this.C('created_at'),
                this.C('updated_at'),
                hasUser ? client.raw('l_me.type AS user_reaction') : client.raw('NULL AS user_reaction'),
                client.raw('CAST(cats.categories_json AS CHAR) AS categories_json'),
            ])
            .first();

        if (!row) return null;

        return {
            id:                 row.id,
            author_id:          row.author_id,
            author_username:    String(row.author_username ?? ''),
            author_avatar_url:  String(row.author_avatar_url ?? ''),
            title:              row.title,
            status:             row.status,
            content:            row.content,
            likes:              row.likes,
            dislikes:           row.dislikes,
            user_reaction:      hasUser ? (row.user_reaction ?? null) : null,
            categories:         parseCategoriesJson(row.categories_json),
            created_at:         row.created_at,
            updated_at:         row.updated_at,
        };
    }

    // ----- READ MANY: возвращаем PostRow[] -----
    async select(userId: string | null | undefined): Promise<PostRow[]> {
        const client  = this.builder.client!;
        const hasUser = Boolean(userId);

        const catsSub = client
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

        let q = this.builder
            .clone()
            .leftJoin({ cats: catsSub as any }, 'cats.post_id', this.C('id'))
            .leftJoin({ u: 'users' }, 'u.id', this.C('author_id'));

        if (hasUser) {
            const uid = String(userId);
            const raw = client.raw('l_me.author_id = ?', [uid]);
            q = q.leftJoin({ l_me: 'post_likes' }, function () {
                this.on('l_me.post_id', '=', 'p.id').on(raw);
            });
        }

        const rows: any[] = await q
            .clearSelect()
            .select([
                this.C('id'),
                this.C('author_id'),
                client.raw('u.username AS author_username'),
                client.raw('u.avatar_url AS author_avatar_url'),
                this.C('title'),
                this.C('status'),
                this.C('content'),
                this.C('likes'),
                this.C('dislikes'),
                this.C('created_at'),
                this.C('updated_at'),
                hasUser ? client.raw('l_me.type AS user_reaction') : client.raw('NULL AS user_reaction'),
                client.raw('CAST(cats.categories_json AS CHAR) AS categories_json'),
            ]);

        return (rows ?? []).map((row) => ({
            id:                 row.id,
            author_id:          row.author_id,
            author_username:    String(row.author_username ?? ''),
            author_avatar_url:  String(row.author_avatar_url ?? ''),
            title:              row.title,
            status:             row.status,
            content:            row.content,
            likes:              row.likes,
            dislikes:           row.dislikes,
            user_reaction:      hasUser ? (row.user_reaction ?? null) : null,
            categories:         parseCategoriesJson(row.categories_json),
            created_at:         row.created_at,
            updated_at:         row.updated_at,
        }));
    }

    // ----- ФИЛЬТРЫ/СОРТ/ПАГИНАЦИЯ/COUNT -----
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
        const b = this.builder.client!;
        this.builder = this.builder.whereExists((qb) =>
            qb.select(b.raw('1'))
                .from('users as u')
                .whereRaw('u.id = ??', [this.C('author_id')])
                .andWhere('u.username', username)
        );
        this.counter = this.counter.whereExists((qb) =>
            qb.select(b.raw('1'))
                .from('users as u')
                .whereRaw('u.id = ??', [this.C('author_id')])
                .andWhere('u.username', username)
        );
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

    filterCategory(categoryId: string): this {
        if (!categoryId) return this;

        this.builder = this.builder.whereExists((qb) =>
            qb.select(this.builder.client!.raw('1'))
                .from('post_categories as pc')
                .whereRaw('pc.post_id = ??', [this.C('id')])
                .where('pc.category_id', categoryId)
        );

        this.counter = this.counter.whereExists((qb) =>
            qb.select(this.counter.client!.raw('1'))
                .from('post_categories as pc')
                .whereRaw('pc.post_id = ??', [this.C('id')])
                .where('pc.category_id', categoryId)
        );

        return this;
    }

    filterUserLike(type: 'like' | 'dislike' | 'none', userId: string): this {
        const client = this.builder.client!;
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
        const row: any = await (this.counter.clone() as any).clearOrder?.().count({ cnt: '*' }).first();
        const val = row?.cnt ?? row?.['count(*)'] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}

function parseCategoriesJson(raw: any): CategoryRow[] {
    if (raw == null) return [];
    try {
        if (Buffer.isBuffer(raw)) raw = raw.toString('utf8');
        if (typeof raw === 'object' && raw?.type === 'Buffer' && Array.isArray(raw.data)) {
            raw = Buffer.from(raw.data).toString('utf8');
        }
        let arr: any;
        if (typeof raw === 'string') arr = JSON.parse(raw);
        else if (Array.isArray(raw)) arr = raw;
        else if (typeof raw === 'object') arr = raw;
        else return [];
        if (!Array.isArray(arr)) return [];
        return arr.map((c: any) => ({
            id: String(c.id),
            title: String(c.title),
            description: c.description == null ? "" : String(c.description),
            created_at: c.created_at ? new Date(c.created_at) : new Date(0),
            updated_at: c.updated_at ? new Date(c.updated_at) : null,
        }));
    } catch (e) {
        console.error('parseCategoriesJson failed. typeof:', typeof raw, 'sample:', String(raw).slice(0, 200));
        return [];
    }
}
