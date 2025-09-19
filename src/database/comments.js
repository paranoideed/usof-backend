export const COMMENTS_TABLE = "comments";

export default class CommentsQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone().count({ count: '*' });
    }

    New() {
        return new CommentsQ(this.builder.clone());
    }

    async insert({ id, post_id, user_id, content, created_at = new Date(), parent_id = null }) {
        const data = {
            id: id,
            post_id: post_id,
            user_id: user_id,
            parent_id: parent_id,
            content: content,
            created_at: created_at,
            updated_at: created_at,
            deleted_at: null,
        };
        await this.builder.clone().insert(data);
        return data;
    }

    async update(set) {
        const setMap = {};
        if (set.content !== undefined) setMap.content = set.content;
        if (set.updated_at !== undefined) setMap.updated_at = set.updated_at;
        if (set.deleted_at !== undefined) setMap.deleted_at = set.deleted_at;

        await this.builder.clone().update(setMap);
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
        await this.builder.clone().del();
    }

    filterID(id) {
        this.builder = this.builder.where("id", id);
        this.counter = this.counter.where("id", id);
        return this;
    }

    filterPostID(postID) {
        this.builder = this.builder.where("post_id", postID);
        this.counter = this.counter.where("post_id", postID);
        return this;
    }

    filterUserID(userID) {
        this.builder = this.builder.where("user_id", userID);
        this.counter = this.counter.where("user_id", userID);
        return this;
    }

    filterParentID(parentID) {
        this.builder = this.builder.where("parent_id", parentID);
        this.counter = this.counter.where("parent_id", parentID);
        return this;
    }

    filterRootOnly() {
        this.builder = this.builder.whereNull("parent_id");
        this.counter = this.counter.whereNull("parent_id");
        return this;
    }

    filterNotDeleted() {
        this.builder = this.builder.whereNull("deleted_at");
        this.counter = this.counter.whereNull("deleted_at");
        return this;
    }

    filterDeletedOnly() {
        this.builder = this.builder.whereNotNull("deleted_at");
        this.counter = this.counter.whereNotNull("deleted_at");
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

    async selectDescendants(rootCommentID, { includeSelf = true } = {}) {
        const qb = this.builder.clone()
            .clearSelect()
            .withRecursive("r", (q) => {
                q.select("*").from(COMMENTS_TABLE).where("id", rootCommentID)
                    .unionAll(function () {
                        this.select("c.*")
                            .from({ c: COMMENTS_TABLE })
                            .join({ r: "r" }, "c.parent_id", "r.id");
                    });
            })
            .select("*")
            .from("r");

        if (!includeSelf) qb.whereNot("id", rootCommentID);

        const rows = await qb;
        return (rows ?? []).map(r => ({
            ...r,
            created_at: r.created_at ? new Date(r.created_at) : null,
            updated_at: r.updated_at ? new Date(r.updated_at) : null,
            deleted_at: r.deleted_at ? new Date(r.deleted_at) : null,
        }));
    }

    async selectAncestors(commentID, { includeSelf = true } = {}) {
        const qb = this.builder.clone()
            .clearSelect()
            .withRecursive("r", (q) => {
                q.select("*").from(COMMENTS_TABLE).where("id", commentID)
                    .unionAll(function () {
                        this.select("p.*")
                            .from({ p: COMMENTS_TABLE })
                            .join({ r: "r" }, "p.id", "r.parent_id");
                    });
            })
            .select("*")
            .from("r");

        if (!includeSelf) qb.whereNot("id", commentID);

        const rows = await qb;
        return (rows ?? []).map(r => ({
            ...r,
            created_at: r.created_at ? new Date(r.created_at) : null,
            updated_at: r.updated_at ? new Date(r.updated_at) : null,
            deleted_at: r.deleted_at ? new Date(r.deleted_at) : null,
        }));
    }


    page(limit, offset = 0) {
        this.builder = this.builder.limit(limit).offset(offset);
        return this;
    }

    async count() {
        const row = await this.counter.clone().clearOrder?.().count({ cnt: "*" }).first();
        const val = row?.cnt ?? row?.['count(*)'] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}
