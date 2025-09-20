export const categoriesTable = "categories";

export default class CategoriesQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone();
    }

    New() {
        return new CategoriesQ(this.builder.clone());
    }

    async insert({ id, title, createdAt = new Date() }) {
        const data = {
            ...(id !== undefined ? { id } : {}),
            title,
            created_at: createdAt,
        };
        await this.builder.clone().insert(data);
        return data;
    }

    async get() {
        const row = await this.builder.first();
        return row ? toCategory(row) : null;
    }

    async select() {
        const rows = await this.builder;
        return (rows ?? []).map(toCategory);
    }

    async update(set) {
        const setMap = {};
        if (Object.prototype.hasOwnProperty.call(set, "title")) setMap.title = set.title;
        if (Object.prototype.hasOwnProperty.call(set, "updatedAt")) {
            setMap.updated_at = set.updatedAt;
        } else {
            setMap.updated_at = new Date();
        }

        await this.builder.clone().update(setMap);
    }

    async delete() {
        await this.builder.clone().del();
    }

    filterID(id) {
        this.builder = this.builder.where("id", id);
        this.counter = this.counter.where("id", id);
        return this;
    }

    filterTitle(title) {
        this.builder = this.builder.where("title", title);
        this.counter = this.counter.where("title", title);
        return this;
    }

    filterTitleLike(substr) {
        const v = `%${substr}%`;
        this.builder = this.builder.where("title", "like", v);
        this.counter = this.counter.where("title", "like", v);
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

    page(limit, offset = 0) {
        this.builder = this.builder.limit(limit).offset(offset);
        return this;
    }

    async count() {
        const row = await this.counter.clone().clearOrder?.().count({ cnt: "*" }).first();
        const val = row?.cnt ?? row?.['count(*)'] ?? Object.values(row ?? {0:0})[0] ?? 0;
        return Number(val);
    }
}

function toCategory(row) {
    let res = {
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
    };
    if (row.updated_at) {
        res.updatedAt = row.updated_at;
    }
}