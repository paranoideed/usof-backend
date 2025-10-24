import { v4 as uuid } from 'uuid';

import {Conflict, Forbidden, Unauthorized} from "../../api/errors";

import database, {Database} from "../../repo/sql/database";

import {
    LoginInput,
    RegisterInput,
    ResetPasswordInput,
} from "./auth.dto";
import tokenManager, {TokenManager} from "./tokens_manager/manager";
import passwordHasher, {PasswordHasher} from "./password_hasher/hasher";


export type UserToken = {
    user_id: string;
    username: string;
    token: string;
}

export default class AuthDomain {
    private db:     Database;
    private jwt:    TokenManager;
    private hasher: PasswordHasher;

    constructor() {
        this.db = database;
        this.jwt = tokenManager;
        this.hasher = passwordHasher;
    }

    async register(params: RegisterInput): Promise<void> {
        const existing = await this.db.users().filterEmail(params.email).get();
        if (existing) throw new Conflict('User with this email already exists');

        const existingUsername = await this.db.users().filterUsername(params.username).get();
        if (existingUsername) throw new Conflict('User with this username already exists');

        const pasHash = await this.hasher.hashPassword(params.password);

        await this.db.users().insert({
            id:            uuid(),
            role:          params.role,
            email:         params.email,
            username:      params.username,
            password_hash: pasHash,
            created_at:    new Date(),
        });
    }

    async login(params: LoginInput): Promise<UserToken> {
        let user;
        if (params.email) {
            user = await this.db.users().filterEmail(params.email).get();
        } else if (params.username) {
            user = await this.db.users().filterUsername(params.username).get();
        }

        if (!user) {
            throw new Forbidden('Invalid credentials');
        }

        const isValid = await this.hasher.verifyPassword(params.password, user.password_hash);
        if (!isValid) {
            throw new Forbidden('Invalid credentials');
        }

        const token = this.jwt.createToken(user.id, user.role);

        return {
            user_id:  user.id,
            username: user.username,
            token:    token
        };
    }

    async resetPassword(params: ResetPasswordInput): Promise<void> {
        const user = await this.db.users().filterID(params.user_id).get();
        if (!user) {
            throw new Unauthorized('User not found');
        }

        const newHash = await this.hasher.hashPassword(params.new_password);

        await this.db.users().filterID(user.id).update({
            password_hash: newHash,
            updated_at: new Date(),
        });
    }
}
