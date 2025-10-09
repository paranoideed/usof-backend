import { Knex } from 'knex';

export type UserRole = 'admin' | 'user';

export type UserRow = {
    id:            string;
    role:          UserRole;
    email:         string;
    username:      string;
    pseudonym:     string | null;
    avatar:        string | null;
    reputation:    number;
    password_hash: string;
    created_at:    Date;
    updated_at:    Date | null;
};

export default class UsersQ {
    private builder: Knex.QueryBuilder<UserRow, UserRow[]>;
    private counter: Knex.QueryBuilder<UserRow, UserRow[]>;

    constructor(builder: Knex.QueryBuilder<UserRow, UserRow[]>) {
        this.builder = builder;
        this.counter = builder.clone();
    }

    async insert(params: {
        id:            string;
        role:          UserRole;
        email:         string;
        username:      string;
        pseudonym?:    string | null;
        avatar?:       string | null;
        password_hash: string;
        reputation?:   number;
        created_at?:   Date;
    }): Promise<UserRow> {
        const data: UserRow = {
            id:            params.id,
            role:          params.role,
            email:         params.email,
            username:      params.username,
            pseudonym:     params.pseudonym ?? null,
            avatar:        params.avatar ?? null,
            password_hash: params.password_hash,
            reputation:    params.reputation ?? 0,
            created_at:    params.created_at ?? new Date(),
            updated_at:    null,
        };

        await this.builder.clone().insert(data);
        return data;
    }

    async get(): Promise<UserRow | null> {
        const row = await this.builder.clone().first();
        return row ?? null;
    }

    async select(): Promise<UserRow[]> {
        const rows = await this.builder.clone();
        return rows ?? [];
    }

    async update(set: {
        role?:          UserRole;
        email?:         string;
        username?:      string;
        pseudonym?:     string | null;
        avatar?:        string | null;
        reputation?:    number;
        password_hash?: string;
        updated_at?:    Date;
    }): Promise<void> {
        const setMap: Partial<UserRow> = {};

        if (Object.prototype.hasOwnProperty.call(set, 'role'))          setMap.role = set.role!;
        if (Object.prototype.hasOwnProperty.call(set, 'email'))         setMap.email = set.email!;
        if (Object.prototype.hasOwnProperty.call(set, 'username'))      setMap.username = set.username!;
        if (Object.prototype.hasOwnProperty.call(set, 'pseudonym'))     setMap.pseudonym = set.pseudonym!;
        if (Object.prototype.hasOwnProperty.call(set, 'avatar'))        setMap.avatar = set.avatar!;
        if (Object.prototype.hasOwnProperty.call(set, 'reputation'))    setMap.reputation = set.reputation!;
        if (Object.prototype.hasOwnProperty.call(set, 'password_hash')) setMap.password_hash = set.password_hash!;
        if (Object.prototype.hasOwnProperty.call(set, 'updated_at'))    setMap.updated_at = set.updated_at!;

        await this.builder.clone().update(setMap);
    }

    async delete(): Promise<void> {
        await this.builder.clone().del();
    }

    filterID(id: string): this {
        this.builder = this.builder.where('id', id);
        this.counter = this.counter.where('id', id);
        return this;
    }

    filterEmail(email: string): this {
        this.builder = this.builder.where('email', email);
        this.counter = this.counter.where('email', email);
        return this;
    }

    filterUsername(username: string): this {
        this.builder = this.builder.where('username', username);
        this.counter = this.counter.where('username', username);
        return this;
    }

    filterUsernameLike(substr: string): this {
        const v = `%${substr}%`;
        this.builder = this.builder.where('username', 'like', v);
        this.counter = this.counter.where('username', 'like', v);
        return this;
    }

    filterRole(role: UserRole): this {
        this.builder = this.builder.where('role', role);
        this.counter = this.counter.where('role', role);
        return this;
    }

    orderByCreatedAt(asc = false): this {
        this.builder = this.builder.orderBy('created_at', asc ? 'asc' : 'desc');
        return this;
    }

    page(limit: number, offset = 0): this {
        this.builder = this.builder.limit(limit).offset(offset);
        return this;
    }

    async count(): Promise<number> {
        const row: any = await this.counter.clone().clearOrder?.().count({ cnt: '*' }).first();
        const val = row?.cnt ?? row?.['count(*)'] ?? Object.values(row ?? { 0: 0 })[0] ?? 0;
        return Number(val);
    }
}
