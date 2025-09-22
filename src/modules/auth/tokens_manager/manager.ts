import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

export interface TokenData {
    userId: string;
    role: string;
    exp: number;
}

export interface TokenManagerConfig {
    secretKey: string;
    ttl:       number;
}

export default class TokenManager {
    private readonly secretKey: Secret;
    private readonly expiresIn: SignOptions["expiresIn"];

    constructor(config: TokenManagerConfig) {
        if (!config.secretKey) {
            throw new Error("TokenManager: secretKey is required");
        }
        this.secretKey = config.secretKey as Secret;
        this.expiresIn = config.ttl;
    }

    createToken(userId: string, role: string): string {
        if (!userId || !role) {
            throw new Error("TokenManager.createToken: userId and role are required");
        }
        const payload = { userId, role };

        const options: SignOptions = {
            expiresIn: this.expiresIn,
            algorithm: "HS256",
        };

        return jwt.sign(payload, this.secretKey, options);
    }

    verifyToken(token: string): TokenData {
        if (!token) throw new Error("TokenManager.verifyToken: token is required");

        const raw = TokenManager.stripBearer(token);
        const decoded = jwt.verify(raw, this.secretKey) as JwtPayload & {
            userId: string;
            role: string;
        };

        return {
            userId: decoded.userId,
            role: decoded.role,
            exp: decoded.exp as number,
        };
    }

    static stripBearer(header: string): string {
        const s = header.trim();
        return s.toLowerCase().startsWith("bearer ") ? s.slice(7).trim() : s;
    }
}
