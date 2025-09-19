export const usersTable = "users";

export default class UsersQ {
    constructor(builder) {
        this.builder = builder;
        this.counter = builder.clone().count({ count: '*' });
    }

    New() {
        return new UsersQ(this.builder.clone());
    }

    async insert({ id, role, email, login, password_hash, pseudonym = null, avatar = null, reputation = 0, created_at = new Date() }) {
        const user = {
            id: id,
            role: role,
            email: email,
            login: login,
            password_hash: password_hash,
            pseudonym: pseudonym,
            avatar: avatar,
            reputation: reputation,
            updated_at: created_at,
            created_at: created_at,
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

    async update({ role, email, login, password_hash, pseudonym, avatar, reputation, updated_at = new Date() }) {
        const setMap = {};
        if (role !== undefined) setMap.role = role;
        if (email !== undefined) setMap.email = email;
        if (login !== undefined) setMap.login = login;
        if (password_hash !== undefined) setMap.password_hash = password_hash;
        if (pseudonym !== undefined) setMap.pseudonym = pseudonym;
        if (avatar !== undefined) setMap.avatar = avatar;
        if (reputation !== undefined) setMap.reputation = reputation;
        if (updated_at !== undefined) setMap.updated_at = updated_at;

        await this.builder.update(setMap);
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

    filterLogin(login) {
        this.builder = this.builder.where('login', login);
        this.counter = this.counter.where('login', login);
        return this;
    }

    filterLoginLike(substr) {
        const cond = "login LIKE ?";
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
        this.counter = this.counter.limit(limit).offset(offset);
        return this;
    }

    async count() {
        const row = await this.counter.clone().clearOrder?.().count({ count: '*' }).first();
        const val = row?.count ?? row?.['count(*)'] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}