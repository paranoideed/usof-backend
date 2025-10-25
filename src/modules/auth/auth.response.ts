import {LoginResult} from "./auth.domain";

export type LoginResponse = {
    data: {
        id: string;
        type: "login"
        attributes: {
            token:      string;
            username:   string;
            pseudonym:  string | null;
            avatar_url: string | null;
            reputation: number;
            created_at: Date;
            updated_at: Date | null;
        }
    }
}

export function loginResponse(input: LoginResult): LoginResponse {
    return {
        data: {
            id: input.profile.id,
            type: "login",
            attributes: {
                token:      input.token,
                username:   input.profile.username,
                pseudonym:  input.profile.pseudonym,
                avatar_url: input.profile.avatar_url,
                reputation: input.profile.reputation,
                created_at: input.profile.created_at,
                updated_at: input.profile.updated_at,
            }
        }
    };
}

