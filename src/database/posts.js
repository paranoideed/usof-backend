const TABLE = "posts";

export default class PostsQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone().count({ count: '*' });
    }

    New() { return new PostsQ(this.builder.clone()); }

    async insert({ id, user_id, title, content, status, created_at = new Date() }) {
        const post = {
            id:         id,
            user_id:    user_id,
            title:      title,
            content:    content,
            status:     status,
            created_at: created_at,
            updated_at: created_at,
        }
        await this.builder.insert(post);
        return post;
    }

    async update({ title, content, status, updated_at = new Date() }) {
        const setMap = {};
        if (title !== undefined) setMap.title = title;
        if (content !== undefined) setMap.content = content;
        if (status !== undefined) setMap.status = status;
        if (updated_at !== undefined) setMap.updated_at = updated_at;

        await this.builder.update(setMap);
    }

    async get() {
        const row = await this.builder.first();
        return row ?? null;
    }

    async select() {
        const rows = await this.builder.clone();
        return rows ?? [];
    }

    async delete() {
        await this.builder.del();
    }

    filterID(id) {
        this.builder = this.builder.where("id", id);
        this.counter = this.counter.where("id", id);
        return this;
    }

    filterUserID(userID) {
        this.builder = this.builder.where("user_id", userID);
        this.counter = this.counter.where("user_id", userID);
        return this;
    }

    filterStatus(...statuses) {
        this.builder = this.builder.whereIn("status", statuses);
        this.counter = this.counter.whereIn("status", statuses);
        return this;
    }

    filterTitleLike(substr) {
        this.builder = this.builder.where("title", "like", `%${substr}%`);
        this.counter = this.counter.where("title", "like", `%${substr}%`);
        return this;
    }

    filterCreatedFrom(ts) {
        this.builder = this.builder.where("created_at", ">=", ts);
        this.counter = this.counter.where("created_at", ">=", ts);
        return this;
    }

    orderByCreatedAt(asc) {
        this.builder = this.builder.orderBy("created_at", asc ? "asc" : "desc");
        return this;
    }

    orderByTitle(asc) {
        this.builder = this.builder.orderBy("title", asc ? "asc" : "desc");
        return this;
    }

    page(limit, offset) {
        this.builder = this.builder.limit(limit).offset(offset);
        return this;
    }

    async count() {
        const row = await this.counter.clone().clearOrder?.().count({ count: '*' }).first();
        const val = row?.count ?? row?.['count(*)'] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}
