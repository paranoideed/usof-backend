import { Knex } from "knex";

export type PostLikeRow = {
    id:         string;
    post_id:    string;
    author_id:  string;
    type:       "like" | "dislike";
    created_at: Date;
};

export type PostLikeView = PostLikeRow & {
    author_username: string;
};

export default class PostLikesQ {
    private builder: Knex.QueryBuilder<PostLikeRow, PostLikeRow[]>;
    private counter: Knex.QueryBuilder<PostLikeRow, PostLikeRow[]>;
    private joined = false;

    constructor(builder: Knex.QueryBuilder<PostLikeRow, PostLikeRow[]>) {
        // ожидаем, что builder = knex<PostLikeRow>("post_likes")
        this.builder = builder;
        this.counter = builder.clone();
    }

    private joinUsersOnce() {
        if (this.joined) return;
        this.builder = this.builder.join({ u: "users" }, "u.id", "post_likes.author_id");
        this.counter = this.counter.join({ u: "users" }, "u.id", "post_likes.author_id");
        this.joined = true;
    }

    async upsert(params: {
        id: string;
        post_id: string;
        author_id: string;
        type: "like" | "dislike";
        created_at: Date;
    }): Promise<PostLikeRow> {
        const data: PostLikeRow = {
            id: params.id,
            post_id: params.post_id,
            author_id: params.author_id,
            type: params.type,
            created_at: params.created_at,
        };

        await this.builder.clone().upsert(data); // твой helper/плагин
        return data;
    }

    async get(): Promise<PostLikeView | null> {
        const row = await this.builder
            .clone()
            .leftJoin({ u: "users" }, "u.id", "post_likes.author_id")
            .select(
                "post_likes.*",
                this.builder.client.ref("u.username").as("author_username"),
            )
            .first() as unknown as PostLikeView | undefined;

        return row ?? null;
    }

    async select(): Promise<PostLikeView[]> {
        const rows = await this.builder
            .clone()
            .leftJoin({ u: "users" }, "u.id", "post_likes.author_id")
            .select(
                "post_likes.*",
                this.builder.client.ref("u.username").as("author_username"),
            ) as unknown as PostLikeView[];

        return rows ?? [];
    }

    async update(set: { type?: "like" | "dislike" }): Promise<void> {
        const setMap: Partial<PostLikeRow> = {};
        if (Object.prototype.hasOwnProperty.call(set, "type")) setMap.type = set.type!;
        await this.builder.clone().update(setMap);
    }

    async delete(): Promise<void> {
        await this.builder.clone().del();
    }

    filterID(id: string): this {
        this.builder = this.builder.where("post_likes.id", id);
        this.counter = this.counter.where("post_likes.id", id);
        return this;
    }

    filterPostID(postId: string): this {
        this.builder = this.builder.where("post_likes.post_id", postId);
        this.counter = this.counter.where("post_likes.post_id", postId);
        return this;
    }

    filterAuthorID(authorId: string): this {
        this.builder = this.builder.where("post_likes.author_id", authorId);
        this.counter = this.counter.where("post_likes.author_id", authorId);
        return this;
    }

    // фильтр по нику через JOIN users
    filterUsername(username: string): this {
        this.joinUsersOnce();
        this.builder = this.builder.where("u.username", username);
        this.counter = this.counter.where("u.username", username);
        return this;
    }

    filterType(type: "like" | "dislike"): this {
        this.builder = this.builder.where("post_likes.type", type);
        this.counter = this.counter.where("post_likes.type", type);
        return this;
    }

    orderByCreatedAt(asc = false): this {
        this.builder = this.builder.orderBy("post_likes.created_at", asc ? "asc" : "desc");
        return this;
    }

    page(limit: number, offset = 0): this {
        this.builder = this.builder.limit(limit).offset(offset);
        return this;
    }

    async count(): Promise<number> {
        // если был JOIN — считаем DISTINCT по id
        const row: any = await this.counter.clone().clearOrder?.()
            .countDistinct({ cnt: "post_likes.id" }).first();
        const val = row?.cnt ?? row?.["count(*)"] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}
