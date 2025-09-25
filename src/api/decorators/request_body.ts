import type { Request, Response, NextFunction } from "express";

// TS 5.x, new decorator format
export function MustRequestBody() {
    return function <
        T extends (req: Request, res: Response, next: NextFunction) => any
    >(originalMethod: T, context: ClassMethodDecoratorContext) {

        return function (this: unknown, req: Request, res: Response, next: NextFunction) {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).send({
                    error: "Bad Request",
                    message: "Request body is missing or empty."
                });
            }
            return originalMethod.call(this, req, res, next);
        } as T;
    };
}
