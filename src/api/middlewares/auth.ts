import type { Request, Response, NextFunction } from "express";

import tokenManager from "../../modules/auth/tokens_manager/manager";
import { Unauthorized } from "../errors";

declare global {
    namespace Express {
        interface UserTokenDataInfo {
            id:   string;
            role: string;
        }

        interface Request {
            user?: UserTokenDataInfo;
        }
    }
}

export default function authMiddleware(
    req:  Request,
    res:  Response,
    next: NextFunction,
) {
    req.user ??= {} as any;
    try {
        let token = "";

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")?.[1] || "";
        }
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            throw new Unauthorized("No access token provided");
        }

        const payload = tokenManager.verifyToken(token);
        req.user = {
            id:   payload.sub,
            role: payload.role
        };
        next();
    } catch (err) {
        next(new Unauthorized("Invalid or expired access token"));
    }
}
