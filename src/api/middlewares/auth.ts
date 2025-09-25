import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../errors";
import TokenManager from "../../modules/auth/tokens_manager/manager";
import {config} from "../../utils/config/config";

const JwtService = new TokenManager(config.jwt)

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

export function authMiddleware(
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
            throw new UnauthorizedError("No access token provided");
        }

        const payload = JwtService.verifyToken(token);
        req.user = {
            id:   payload.sub,
            role: payload.role
        };
        next();
    } catch (err) {
        next(new UnauthorizedError("Invalid or expired access token"));
    }
}
