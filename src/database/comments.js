export const COMMENTS_TABLE = "comments";

export default class CommentsQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone();
    }

    New() {
        return new CommentsQ(this.builder.clone());
    }

    async insert({ id, postID, userID, content, createdAt = new Date(), parentID = null }) {
        const data = {
            ...(id !== undefined ? { id } : {}),
            post_id:    postID,
            user_id:    userID,
            parent_id:  parentID,
            content:    content,
            created_at: createdAt,
        };
        await this.builder.clone().insert(data);
        return data;
    }

    async update(set) {
        const setMap = {};
        if (Object.prototype.hasOwnProperty.call(set, "postID")) setMap.post_id = set.postID;
        if (Object.prototype.hasOwnProperty.call(set, "userID")) setMap.user_id = set.userID;
        if (Object.prototype.hasOwnProperty.call(set, "parentID")) setMap.parent_id = set.parentID;
        if (Object.prototype.hasOwnProperty.call(set, "content")) setMap.content = set.content;
        if (Object.prototype.hasOwnProperty.call(set, "updatedAt")) {
            setMap.updated_at = set.updatedAt;
        } else {
            setMap.updated_at = new Date();
        }
        if (Object.prototype.hasOwnProperty.call(set, "deletedAt")) {
            setMap.deleted_at = set.deletedAt;
        }

        await this.builder.clone().update(setMap);
    }

    async get() {
        const row = await this.builder.first();
        return row ? toComment(row) : null;
    }

    async select() {
        const rows = await this.builder;
        return (rows ?? []).map(toComment);
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

function toComment(row) {
    let res = {
        id:         row.id,
        postID:     row.post_id,
        userID:     row.user_id,
        content:    row.content,
        createdAt:  row.created_at,
    };
    if (row.parent_id) { res.parentID = row.parent_id; }
    if (row.updated_at) { res.updatedAt = row.updated_at; }
    if (row.deleted_at) { res.deletedAt = row.deleted_at; }
    return res;
}

// async selectDescendants(rootCommentID, { includeSelf = true } = {}) {
//     const qb = this.builder.clone()
//         .clearSelect()
//         .withRecursive("r", (q) => {
//             q.select("*").from(COMMENTS_TABLE).where("id", rootCommentID)
//                 .unionAll(function () {
//                     this.select("c.*")
//                         .from({ c: COMMENTS_TABLE })
//                         .join({ r: "r" }, "c.parent_id", "r.id");
//                 });
//         })
//         .select("*")
//         .from("r");
//
//     if (!includeSelf) qb.whereNot("id", rootCommentID);
//
//     const rows = await qb;
//     return (rows ?? []).map(toComment);
// }
//
// async selectAncestors(commentID, { includeSelf = true } = {}) {
//     const qb = this.builder.clone()
//         .clearSelect()
//         .withRecursive("r", (q) => {
//             q.select("*").from(COMMENTS_TABLE).where("id", commentID)
//                 .unionAll(function () {
//                     this.select("p.*")
//                         .from({ p: COMMENTS_TABLE })
//                         .join({ r: "r" }, "p.id", "r.parent_id");
//                 });
//         })
//         .select("*")
//         .from("r");
//
//     if (!includeSelf) qb.whereNot("id", commentID);
//
//     const rows = await qb;
//     return (rows ?? []).map(toComment);
// }
