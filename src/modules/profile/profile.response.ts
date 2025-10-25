import {Profile, ProfileList} from "./profile.domain";

export type ProfileResponse = {
    data: {
        id: string;
        type: "profile"
        attributes: {
            username:   string;
            pseudonym:  string | null;
            avatar_url: string | null;
            reputation: number;
            created_at: Date;
            updated_at: Date | null;
        }
    }
}

export function profileResponse(input: Profile): ProfileResponse {
    return {
        data: {
            id: input.id,
            type: "profile",
            attributes: {
                username:   input.username,
                pseudonym:  input.pseudonym,
                avatar_url: input.avatar_url,
                reputation: input.reputation,
                created_at: input.created_at,
                updated_at: input.updated_at,
            }
        }
    };
}

export type ProfilesListResponse = {
    data: {
        id: string;
        type: "profile"
        attributes: {
            username:   string;
            pseudonym:  string | null;
            avatar_url: string | null;
            reputation: number;
            created_at: Date;
            updated_at: Date | null;
        }
    }[];
    meta: {
        total:  number;
        limit:  number;
        offset: number;
    }
}

export function profileListResponse(items: ProfileList): ProfilesListResponse {
    return {
        data: items.data.map((input) => ({
            id: input.id,
            type: "profile",
            attributes: {
                username:   input.username,
                pseudonym:  input.pseudonym,
                avatar_url: input.avatar_url,
                reputation: input.reputation,
                created_at: input.created_at,
                updated_at: input.updated_at,
            }
        })),
        meta: {
            total:  items.pagination.total,
            limit:  items.pagination.limit,
            offset: items.pagination.offset,
        }
    };
}