import { v4 as uuid } from 'uuid';

import Config from "../../utils/config/config";
import {Database} from "../../database/database";
import TokenManager from "./tokens_manager/manager";
import PasswordHasher from "./password_hasher/hasher";
import {LoginInput, RegisterInput, ResetPasswordInput} from "./auth.dto";
import {InvalidCredentialsError, UserAlreadyExistsError, UserNotFoundError} from "../errors";

export type UserToken = {
    token: string;
}

export class AuthDomain {
    private db:     Database;
    private jwt:    TokenManager;
    private hasher: PasswordHasher;

    constructor(cfg: Config) {
        this.db = new Database(cfg.database.sql);
        this.jwt = new TokenManager(cfg.jwt);
        this.hasher = new PasswordHasher();
    }

    async register(params: RegisterInput): Promise<void> {
        const existing = await this.db.users().filterEmail(params.email).get();
        if (existing) throw new UserAlreadyExistsError('User with this email already exists');

        const existingUsername = await this.db.users().filterUsername(params.username).get();
        if (existingUsername) throw new UserAlreadyExistsError('User with this username already exists');

        const pasHash = await this.hasher.hashPassword(params.password);
        const newUser = await this.db.users().New().insert({
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
            throw new UserNotFoundError('Invalid credentials');
        }

        const isValid = await this.hasher.verifyPassword(params.password, user.password_hash);
        if (!isValid) {
            throw new InvalidCredentialsError('Invalid credentials');
        }

        const token = this.jwt.createToken(user.id, user.role);

        return {
            token: token
        };
    }

    async resetPassword(params: ResetPasswordInput): Promise<void> {
        const user = await this.db.users().filterUsername(params.username).filterEmail(params.email).get();
        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        const isValid = await this.hasher.verifyPassword(params.oldPassword, user.password_hash);
        if (!isValid) {
            throw new InvalidCredentialsError('Invalid old password');
        }

        const newHash = await this.hasher.hashPassword(params.newPassword);
        await this.db.users().filterID(user.id).update({
            password_hash: newHash,
            updated_at: new Date(),
        });
    }
}
