export const categoriesTable = "categories";

export default class CategoriesQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone().count({ count: '*' });
    }

    New() {
        return new CategoriesQ(this.builder.clone());
    }

    async insert({ id, title, description = null, created_at = new Date(), updated_at = new Date() }) {
        const data = {
            id: id,
            title: title,
            description: description,
            created_at: created_at,
            updated_at: updated_at,
        };
        await this.builder.clone().insert(data);
        return data;
    }

    async get() {
        const row = await this.builder.first();
        return row ?? null;
    }

    async select() {
        const rows = await this.builder;
        return rows ?? [];
    }

    async update({ title, description, updated_at = new Date() }) {
        const setMap = {};
        if (title !== undefined) setMap.title = title;
        if (description !== undefined) setMap.description = description;
        if (updated_at !== undefined) setMap.updated_at = updated_at;

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
