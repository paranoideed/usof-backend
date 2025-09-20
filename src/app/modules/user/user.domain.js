import TokenManager from './token_manager/manager.js';
import { v4 as uuid } from 'uuid';
import {InvalidPasswordError, InvalidTokenError, UserAlreadyExistsError, UserNotFoundError} from './user.errors.js';
import {Database} from "../../../database/database.js";
import PasswordHasher from "./password_hasher/PasswordHasher.js";

export default class UserDomain {
    constructor(config) {
        this.db = new Database(config);
        this.token = new TokenManager(config);
    }

    async register(
        username,
        email,
        password,
        role
    ) {
        username = String(username).trim();
        email = String(email).trim().toLowerCase();

        const existingByEmail = await this.db.users().New().filterEmail(email).get();
        if (existingByEmail) {
            throw new UserAlreadyExistsError('Email already exists');
        }

        const existingByUsername = await this.db.users().New().filterUsername(username).get();
        if (existingByUsername) {
            throw new UserAlreadyExistsError('Username already exists');
        }

        const pasHash = await PasswordHasher.hashPassword(password);

        const userID = uuid.New()

        const newUser = {
            id: userID,
            email: email,
            username: username,
            pasHash: pasHash,
            pseudonym: null,
            avatar: null,
            reputation: 0,
            createdAt: new Date(),
        };

        await this.db.users().insert(newUser);

        if (role !== 'user' && role !== 'admin') {
            throw new InvalidTokenError('TokenManager.createToken: role must be "user" or "admin"');
        }

        const token = this.token.createToken(userID, role)

        return userTokenFormat(token);
    }

    async login(
        email,
        username,
        password
    ) {
        let query = await this.db.users().New();
        if (email) {
            query = query.filterEmail(email)
        } else if (username) {
            query = query.filterUsername(username)
        } else {
            throw new UserNotFoundError('User not found');
        }

        const user = await query.get();
        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        const isPasswordValid = await PasswordHasher.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            throw new InvalidPasswordError('Invalid password');
        }

        const token = this.token.createToken(
            user.id,
            user.role,
        )

        return userTokenFormat(token);
    }

    async getUserById(userId) {
        const user = await this.db.users().New().filterID(userId).get();
        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        return profileFormat(user);
    }

    async getUserByEmail(email) {
        const user = await this.db.users().New().filterEmail(email).get();
        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        return profileFormat(user);
    }

    async getUserByUsername(username) {
        const user = await this.db.users().New().filterUsername(username).get();
        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        return profileFormat(user);
    }

    async getPrivateData(userId) {
        const user = await this.db.users().New().filterID(userId).get();
        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        return userPrivateDataFormat(user);
    }

    async updateProfile(userId, {username, pseudonym, avatar}) {
        const user = await this.db.users().New().filterID(userId).get();
        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        const updateData = {};
        if (username) {
            const existingUsername = await this.db.users().New().filterUsername(username).get();
            if (existingUsername && existingUsername.id !== userId) {
                throw new UserAlreadyExistsError('Username already exists');
            }
            updateData.username = username;
        }
        if (pseudonym !== undefined) {
            updateData.pseudonym = pseudonym;
        }
        if (avatar !== undefined) {
            updateData.avatar = avatar;
        }
        updateData.updated_at = new Date();

        await this.db.users().New().filterID(userId).update(updateData);

        const updatedUser = await this.db.users().New().filterID(userId).get();
        return profileFormat(updatedUser);
    }

    async listUsers(username, {limit = 10, offset = 0}) {
        let query = this.db.users().New();
        if (username) {
            query = query.filterUsername(username).orderByCreatedAt(limit);
        }

        const total = await query.count();
        const users = await query.page(limit, offset).select();

        return {
            users: users.map(profileFormat),
            total: total,
            limit: limit,
            offset: offset,
        };
    }
}

function profileFormat(user) {
    return {
        id: user.id,
        username: user.username,
        pseudonym: user.pseudonym,
        reputation: user.reputation,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

function userPrivateDataFormat(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
    }
}

function userTokenFormat(token) {
    return {
        token: token,
    }
}

function profilesList(users, {limit, offset, total}) {
    let u = users.map(profileFormat);
    return {
        users: u,
        limit: limit,
        offset: offset,
        total: total,
    }
}