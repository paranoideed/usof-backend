import database, {Database} from '../../repo/sql/database';

import {
    DeleteProfileInput,
    GetProfileInput,
    ListProfilesInput, UpdateAvatarInput,
    UpdateProfileInput,
} from "./profile.dto";
import {NotFound} from "../../api/errors";
import {deleteS3Object, getKeyFromUrl, putUserAvatar} from "../../repo/aws/s3";

export type Profile = {
    id:         string;
    username:   string;
    pseudonym:  string | null;
    avatar_url: string | null;
    reputation: number;
    created_at: Date;
    updated_at: Date | null;
};

export type ProfileList = {
    data: Profile[];
    pagination: {
        offset: number;
        limit:  number;
        total:  number;
    };
}

export default class ProfileDomain {
    private db: Database;

    constructor() {
        this.db = database;
    }

    async getProfile(params: GetProfileInput): Promise<Profile> {
        let user
        if (params.user_id) {
            user = await this.db.users().filterID(params.user_id).get();
        } else if (params.username) {
            user = await this.db.users().filterUsername(params.username).get();
        } else if (params.email) {
            user = await this.db.users().filterEmail(params.email).get();
        }

        if (!user) {
            throw new NotFound('User not found');
        }

        return user;
    }

    async listProfiles(params: ListProfilesInput): Promise<ProfileList> {
        const query = this.db.users();
        if (params.username && params.username.trim() !== '') {
            query.filterUsernameLike(`%${params.username.trim()}%`);
        }

        const total = await query.count()
        const rows = await query.page(params.limit, params.offset).select();

        return {
            data: rows,
            pagination: {
                limit:  params.limit,
                offset: params.offset,
                total:  total,
            },
        };
    }

    async updateProfile(params: UpdateProfileInput): Promise<Profile> {
        const user = await this.db.users().filterID(params.user_id).get();
        if (!user) {
            throw new NotFound('User not found');
        }

        const patch: { username?: string; pseudonym?: string | null ; avatar?: string | null ; updated_at?: Date } = {};
        if (Object.prototype.hasOwnProperty.call(params, 'username'))  patch.username = params.username!;
        if (Object.prototype.hasOwnProperty.call(params, 'pseudonym')) patch.pseudonym = params.pseudonym;
        patch.updated_at = new Date();

        await this.db.users().filterID(params.user_id).update(patch);

        const updated = await this.db.users().filterID(params.user_id).get();
        if (!updated) {
            throw new NotFound('User not found after update');
        }

        return updated;
    }

    async updateAvatar(params: UpdateAvatarInput): Promise<Profile> {
        const user = await this.db.users().filterID(params.user_id).get();
        if (!user) throw new NotFound('User not found');

        const oldAvatarUrl = user.avatar_url;

        const { url: newAvatarUrl } = await putUserAvatar(
            params.user_id,
            params.avatar.buffer,
            params.avatar.mimetype
        );

        const now = new Date();

        await this.db.users().filterID(params.user_id).update({
            updated_at: now,
            avatar_url: newAvatarUrl,
        })

        if (oldAvatarUrl) {
            const oldKey = getKeyFromUrl(oldAvatarUrl);
            if (oldKey) {
                await deleteS3Object(oldKey);
            }
        }

        user.avatar_url = newAvatarUrl;
        user.updated_at = now;

        return user;
    }

    async deleteAvatar(user_id: string): Promise<Profile> {
        const user = await this.db.users().filterID(user_id).get();
        if (!user) throw new NotFound('User not found');

        const oldAvatarUrl = user.avatar_url;
        if (!oldAvatarUrl) {
            return user;
        }

        const oldKey = getKeyFromUrl(oldAvatarUrl);
        if (oldKey) {
            await deleteS3Object(oldKey);
        }

        const now = new Date();

        await this.db.users().filterID(user_id).update({
            updated_at: now,
            avatar_url: null,
        });

        user.avatar_url = null;
        user.updated_at = now;

        return user;
    }
}