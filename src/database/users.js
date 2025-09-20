export const usersTable = "users";

export default class UsersQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone().count({ count: '*' });
    }

    New() {
        return new UsersQ(this.builder.clone());
    }

    async insert({ id, role, email, username, pasHash, pseudonym = null, avatar = null, reputation = 0, createdAt = new Date() }) {
        const user = {
            id: id,
            role: role,
            email: email,
            username: username,
            pasHash: pasHash,
            pseudonym: pseudonym,
            avatar: avatar,
            reputation: reputation,
            updated_at: createdAt,
            created_at: createdAt,
        }
        await this.builder.insert(user);
        return user;
    }

    async get() {
        const row = await this.builder.first();
        return row ?? null;
    }

    async select() {
        const rows = await this.builder;
        return rows ?? [];
    }

    async update(set) {
        const patch = {};
        if (Object.prototype.hasOwnProperty.call(set, "role")) patch.role = set.role;
        if (Object.prototype.hasOwnProperty.call(set, "email")) patch.email = set.email;
        if (Object.prototype.hasOwnProperty.call(set, "username")) patch.username = set.username;
        if (Object.prototype.hasOwnProperty.call(set, "password_hash")) patch.password_hash = set.password_hash;
        if (Object.prototype.hasOwnProperty.call(set, "pseudonym")) patch.pseudonym = set.pseudonym;
        if (Object.prototype.hasOwnProperty.call(set, "avatar")) patch.avatar = set.avatar;
        if (Object.prototype.hasOwnProperty.call(set, "reputation")) patch.reputation = set.reputation;
        patch.updated_at = Object.prototype.hasOwnProperty.call(set, "updatedAt") ? set.updatedAt : new Date();
        await this.builder.update(patch);
    }


    async delete() {
        await this.builder.del();
    }

    filterID(id) {
        this.builder = this.builder.where('id', id);
        this.counter = this.counter.where('id', id);
        return this;
    }

    FilterRole(...roles) {
        if (!roles.length) return this;
        this.builder = this.builder.whereIn('role', roles);
        this.counter = this.counter.whereIn('role', roles);
        return this;
    }

    filterEmail(email) {
        this.builder = this.builder.where('email', email);
        this.counter = this.counter.where('email', email);
        return this;
    }

    filterUsername(username) {
        this.builder = this.builder.where('username', username);
        this.counter = this.counter.where('username', username);
        return this;
    }

    filterUsernameLike(substr) {
        const cond = "username LIKE ?";
        const val = `%${substr}%`;
        this.builder = this.builder.whereRaw(cond, [val]);
        this.counter = this.counter.whereRaw(cond, [val]);
        return this;
    }

    orderByCreatedAt(asc) {
        this.builder = this.builder.orderBy('created_at', asc ? 'asc' : 'desc');
        return this;
    }

    orderByReputation(asc) {
        this.builder = this.builder.orderBy('reputation', asc ? 'asc' : 'desc');
        return this;
    }

    async page(limit, offset) {
        this.builder  = this.builder.limit(limit).offset(offset);
        return this;
    }

    async count() {
        const row = await this.counter.clone().clearOrder?.().count({ count: '*' }).first();
        const val = row?.count ?? row?.['count(*)'] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}

function toUser(row) {
    let res = {
        id: row.id,
        role: row.role,
        email: row.email,
        username: row.username,
        password_hash: row.password_hash,
        reputation: row.reputation,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
    if (row.updated_at) {
        res.updatedAt = row.updated_at;
    }
    if (row.pseudonym) {
        res.pseudonym = row.pseudonym;
    }
    if (row.avatar) {
        res.avatar = row.avatar;
    }

    return res;
}