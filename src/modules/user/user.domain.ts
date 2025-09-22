import {Database} from "../../database/database";
import Config from "../../utils/config/config";
import {GetProfileInput, GetProfilesInput, UpdateProfileInput} from "./user.dto";
import {UserNotFoundError} from "./user.errors";
import {UserRow} from "../../database/users";
import {paginationResponse} from "../../utils/pagination/pagination";

type UserProfile = {
    id:         string;
    username:   string;
    pseudonym:  string | null;
    avatar:     string | null;
    reputation: number;
    createdAt:  Date;
    updatedAt:  Date | null;
};

export class UserDomain {
    private db: Database;

    constructor(cfg: Config) {
        this.db = new Database(cfg.database.sql);
    }

    async getProfile(params: GetProfileInput): Promise<UserProfile> {
        let user
        if (params.user_id) {
            user = await this.db.users().New().filterID(params.user_id).get();
        } else if (params.username) {
            user = await this.db.users().New().filterUsername(params.username).get();
        } else if (params.email) {
            user = await this.db.users().New().filterEmail(params.email).get();
        }

        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        return UserProfileFormat(user);
    }

    async listProfiles(params: GetProfilesInput): Promise<{
        users: UserProfile[];
        pagination: {
            offset: number;
            limit: number;
            total: number;
        }
    }> {
        const query = this.db.users().New();
        if (params.username && params.username.trim() !== '') {
            query.filterUsernameLike(`%${params.username.trim()}%`);
        }

        const total = await query.count()
        const rows = await query.page(params.limit, params.offset).select();

        return {
            users: rows.map(UserProfileFormat),
            pagination: {
                limit: params.limit,
                offset: params.offset,
                total: total,
            },
        };
    }

    async updateProfile(params: UpdateProfileInput): Promise<UserProfile> {
        const user = await this.db.users().New().filterID(params.user_id).get();
        if (!user) {
            throw new UserNotFoundError('User not found');
        }

        const patch: { username?: string; pseudonym?: string | null; avatar?: string | null; updated_at?: Date } = {};
        if (Object.prototype.hasOwnProperty.call(params, 'username'))  patch.username = params.username!;
        if (Object.prototype.hasOwnProperty.call(params, 'pseudonym')) patch.pseudonym = params.pseudonym === undefined ? user.pseudonym : params.pseudonym;
        if (Object.prototype.hasOwnProperty.call(params, 'avatar'))    patch.avatar = params.avatar === undefined ? user.avatar : params.avatar;
        patch.updated_at = new Date();

        await this.db.users().New().filterID(params.user_id).update(patch);

        const updated = await this.db.users().New().filterID(params.user_id).get();
        if (!updated) {
            throw new UserNotFoundError('User not found after update');
        }

        return UserProfileFormat(updated);
    }
}

function UserProfileFormat(row: UserRow): UserProfile {
    return {
        id:         row.id,
        username:   row.username,
        pseudonym:  row.pseudonym,
        avatar:     row.avatar,
        reputation: row.reputation,
        createdAt:  row.created_at,
        updatedAt:  row.updated_at,
    };
}