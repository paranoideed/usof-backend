const TABLE = "post_categories";

export default class PostCategoriesQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone().count({ count: '*' });
    }


    New() {
        return new PostCategoriesQ(this.builder.clone());
    }

    async insert({ post_id, category_id }) {
        const input = {
            post_id: post_id,
            category_id: category_id,
        };
        await this.builder.insert(input);
        return input;
    }

    async get() {
        const row = await this.builder.first();
        return row ?? null;
    }

    async select() {
        const rows = await this.builder;
        return rows ?? [];
    }

    async delete() {
        await this.builder.del();
    }

    filterPostID(postID) {
        this.builder = this.builder.where("post_id", postID);
        this.counter = this.counter.where("post_id", postID);
        return this;
    }

    filterCategoryID(categoryID) {
        this.builder = this.builder.where("category_id", categoryID);
        this.counter = this.counter.where("category_id", categoryID);
        return this;
    }

    page(limit, offset) {
        this.builder  = this.builder.limit(limit).offset(offset);
        return this;
    }

    async count() {
        const row = await this.counter.clone().clearOrder?.().count({ cnt: "*" }).first();
        const val = row?.cnt ?? row?.['count(*)'] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}
