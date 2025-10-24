import { Knex } from "knex";

export type CommentLikeRow = {
    id:         string;
    comment_id: string;
    author_id:  string;
    type:       "like" | "dislike";
    created_at: Date;
};

// то, что реально возвращаем наружу
export type CommentLikeView = CommentLikeRow & {
    author_username: string;
};

export default class CommentLikesQ {
    private builder: Knex.QueryBuilder<CommentLikeRow, CommentLikeRow[]>;
    private counter: Knex.QueryBuilder<CommentLikeRow, CommentLikeRow[]>;
    private joined = false; // чтобы не джоинить дважды

    constructor(builder: Knex.QueryBuilder<CommentLikeRow, CommentLikeRow[]>) {
        this.builder = builder;           // ожидаем, что это FROM comment_likes
        this.counter = builder.clone();   // для count()
    }

    // джоин по требованию (фильтр по username/выборка со столбцом author_username)
    private joinUsersOnce() {
        if (this.joined) return;
        // alias-ы удобны, чтобы не конфликтовали имена
        this.builder = this.builder.join({ u: "users" }, "u.id", "comment_likes.author_id");
        this.counter = this.counter.join({ u: "users" }, "u.id", "comment_likes.author_id");
        this.joined = true;
    }

    async upsert(params: {
        id:         string;
        comment_id: string;
        author_id:  string;
        type:       "like" | "dislike";
        created_at: Date;
    }): Promise<CommentLikeRow> {
        const data: CommentLikeRow = {
            id:         params.id,
            author_id:  params.author_id,
            comment_id: params.comment_id,
            type:       params.type,
            created_at: params.created_at,
        };

        await this.builder.clone().upsert(data);

        return data;
    }

    async get(): Promise<CommentLikeView | null> {
        const q = this.builder
            .clone()
            .leftJoin({ u: "users" }, "u.id", "comment_likes.author_id")
            .select(
                "comment_likes.*",
                this.builder.client.ref("u.username").as("author_username")
            )
            .first() as unknown as Promise<CommentLikeView | undefined>;

        const row = await q;
        return row ?? null;
    }

    // выборка списка с username
    async select(): Promise<CommentLikeView[]> {
        const rows = (await this.builder
            .clone()
            .leftJoin({ u: "users" }, "u.id", "comment_likes.author_id")
            .select(
                "comment_likes.*",
                this.builder.client.ref("u.username").as("author_username")
            )) as unknown as CommentLikeView[];

        return rows ?? [];
    }

    async update(set: { type?: "like" | "dislike" }): Promise<void> {
        const setMap: Partial<CommentLikeRow> = {};
        if (Object.prototype.hasOwnProperty.call(set, "type")) {
            setMap.type = set.type!;
        }
        await this.builder.clone().update(setMap);
    }

    async delete(): Promise<void> {
        await this.builder.clone().del();
    }

    filterID(id: string): this {
        this.builder = this.builder.where("comment_likes.id", id);
        this.counter = this.counter.where("comment_likes.id", id);
        return this;
    }

    filterCommentID(commentId: string): this {
        this.builder = this.builder.where("comment_likes.comment_id", commentId);
        this.counter = this.counter.where("comment_likes.comment_id", commentId);
        return this;
    }

    filterAuthorID(authorId: string): this {
        this.builder = this.builder.where("comment_likes.author_id", authorId);
        this.counter = this.counter.where("comment_likes.author_id", authorId);
        return this;
    }

    // ⚠️ раньше у тебя было where('author_username', ...) — такого столбца нет.
    // теперь фильтруем по users.username через join
    filterUsername(username: string): this {
        this.joinUsersOnce();
        this.builder = this.builder.where("u.username", username);
        this.counter = this.counter.where("u.username", username);
        return this;
    }

    filterType(type: "like" | "dislike"): this {
        this.builder = this.builder.where("comment_likes.type", type);
        this.counter = this.counter.where("comment_likes.type", type);
        return this;
    }

    orderByCreatedAt(asc = false): this {
        this.builder = this.builder.orderBy("comment_likes.created_at", asc ? "asc" : "desc");
        return this;
    }

    page(limit: number, offset = 0): this {
        this.builder = this.builder.limit(limit).offset(offset);
        return this;
    }

    async count(): Promise<number> {
        // если были join-ы — считаем DISTINCT по id, чтобы не раздуть кол-во
        const q = this.counter.clone().clearOrder?.();
        const row: any = await q.countDistinct({ cnt: "comment_likes.id" }).first();
        const val = row?.cnt ?? row?.["count(*)"] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}
