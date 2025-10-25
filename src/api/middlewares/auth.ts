import type { Request, Response, NextFunction } from "express";
import tokenManager from "../../modules/auth/tokens_manager/manager";

declare global {
    namespace Express {
        interface UserTokenDataInfo {
            id?:   string | null;
            role?: string | null;
        }

        interface Request {
            user?: UserTokenDataInfo | null;
        }
    }
}

export default function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    req.user = null;

    try {
        let token = "";

        if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1] ?? "";
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return next();
        }

        const payload = tokenManager.verifyToken(token);

        req.user = {
            id:   payload.sub,
            role: payload.role,
        };

        return next();
    } catch {
        req.user = null;
        return next();
    }
}
