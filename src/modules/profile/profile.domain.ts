import database, {Database} from '../../repo/sql/database';

import {
    GetProfileInput,
    GetProfilesInput, UpdateAvatarInput,
    UpdateProfileInput,
} from "./profile.dto";
import {NotFound, PayloadTooLarge, UnsupportedMediaType} from "../../api/errors";
import {putUserAvatarPNG} from "../../repo/aws/s3";
import log from "../../utils/logger";

export type Profile = {
    id:         string;
    username:   string;
    pseudonym:  string | null;
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

    async listProfiles(params: GetProfilesInput): Promise<ProfileList> {
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

    async updateAvatar(params: UpdateAvatarInput): Promise<void> {
        const user = await this.db.users().filterID(params.user_id).get();
        if (!user) throw new NotFound('User not found');

        if (params.avatar.mimetype !== "image/png") {
            log.error("Avatar upload failed: unsupported media type", { user_id: params.user_id, mimetype: params.avatar.mimetype });
            throw new UnsupportedMediaType("Only image/png is allowed");
        }
        if (params.avatar.size > 10 * 1024 * 1024) {
            log.error("Avatar upload failed: file too large", { user_id: params.user_id, size: params.avatar.size });
            throw new PayloadTooLarge("File too large: max 10MB");
        }

        await putUserAvatarPNG(String(params.user_id), params.avatar.buffer);
    }


    async deleteProfile(user_id: string): Promise<void> {
        const user = await this.db.users().filterID(user_id).get();
        if (!user) {
            throw new NotFound('User not found');
        }

        await this.db.users().filterID(user_id).delete();
    }
}