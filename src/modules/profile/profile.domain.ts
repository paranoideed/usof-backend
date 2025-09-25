import {database, Database} from "../../data/database";
import {UserRow} from "../../data/users";
import {GetProfileInput, GetProfilesInput, UpdateProfileInput} from "./profile.dto";
import {NotFoundError} from "../../api/errors";

export type Profile = {
    id:         string;
    username:   string;
    pseudonym:  string | null;
    avatar:     string | null;
    reputation: number;
    createdAt:  Date;
    updatedAt:  Date | null;
};

export type ProfileList = {
    data: Profile[];
    pagination: {
        offset: number;
        limit:  number;
        total:  number;
    };
}

export class ProfileDomain {
    private db: Database;

    constructor() {
        this.db = database;
    }

    async getProfile(params: GetProfileInput): Promise<Profile> {
        let user
        if (params.user_id) {
            user = await this.db.users().New().filterID(params.user_id).get();
        } else if (params.username) {
            user = await this.db.users().New().filterUsername(params.username).get();
        } else if (params.email) {
            user = await this.db.users().New().filterEmail(params.email).get();
        }

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return UserProfileFormat(user);
    }

    async listProfiles(params: GetProfilesInput): Promise<ProfileList> {
        const query = this.db.users().New();
        if (params.username && params.username.trim() !== '') {
            query.filterUsernameLike(`%${params.username.trim()}%`);
        }

        const total = await query.count()
        const rows = await query.page(params.limit, params.offset).select();

        return {
            data: rows.map(UserProfileFormat),
            pagination: {
                limit: params.limit,
                offset: params.offset,
                total: total,
            },
        };
    }

    async updateProfile(params: UpdateProfileInput): Promise<Profile> {
        const user = await this.db.users().New().filterID(params.user_id).get();
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const patch: { username?: string; pseudonym?: string | null; avatar?: string | null; updated_at?: Date } = {};
        if (Object.prototype.hasOwnProperty.call(params, 'username'))  patch.username = params.username!;
        if (Object.prototype.hasOwnProperty.call(params, 'pseudonym')) patch.pseudonym = params.pseudonym === undefined ? user.pseudonym : params.pseudonym;
        if (Object.prototype.hasOwnProperty.call(params, 'avatar'))    patch.avatar = params.avatar === undefined ? user.avatar : params.avatar;
        patch.updated_at = new Date();

        await this.db.users().New().filterID(params.user_id).update(patch);

        const updated = await this.db.users().New().filterID(params.user_id).get();
        if (!updated) {
            throw new NotFoundError('User not found after update');
        }

        return UserProfileFormat(updated);
    }
}

function UserProfileFormat(row: UserRow): Profile {
    return {
        id:         row.id,
        username:   row.username,
        pseudonym:  row.pseudonym || null,
        avatar:     row.avatar || null,
        reputation: row.reputation,
        createdAt:  row.created_at,
        updatedAt:  row.updated_at || null,
    };
}