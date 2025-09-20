const TABLE = "posts";

export default class PostsQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone().count({ count: '*' });
    }

    New() { return new PostsQ(this.builder.clone()); }

    async insert({ id, userID, title, content, status, createdAt = new Date() }) {
        const post = {
            id:         id,
            user_id:    userID,
            title:      title,
            content:    content,
            status:     status,
            created_at: createdAt,
        }
        await this.builder.insert(post);
        return post;
    }

    async update(set) {
        const setMap = {};
        if (Object.prototype.hasOwnProperty.call(set, "userID")) setMap.user_id = set.userID;
        if (Object.prototype.hasOwnProperty.call(set, "title")) setMap.title = set.title;
        if (Object.prototype.hasOwnProperty.call(set, "content")) setMap.content = set.content;
        if (Object.prototype.hasOwnProperty.call(set, "status")) setMap.status = set.status;
        setMap.updated_at = Object.prototype.hasOwnProperty.call(set, "updatedAt") ? set.updatedAt : new Date();

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

    filterCategoryIDs(categoryIDs) {
        if (!Array.isArray(categoryIDs) || categoryIDs.length === 0) {
            return this; // ничего не фильтруем
        }

        this.builder = this.builder
            .join({ pc: 'post_categories' }, 'pc.post_id', 'posts.id')
            .whereIn('pc.category_id', categoryIDs)
            .groupBy('posts.id');

        this.counter = this.counter
            .join({ pc: 'post_categories' }, 'pc.post_id', 'posts.id')
            .whereIn('pc.category_id', categoryIDs)
            .countDistinct({ cnt: 'posts.id' });

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

function toPost(row) {
    let res = {
        id:         row.id,
        userID:     row.user_id,
        title:      row.title,
        content:    row.content,
        status:     row.status,
        createdAt:  row.created_at,
    };
    if (row.updated_at) {
        res.updatedAt = row.updated_at;
    }
    return res;
}