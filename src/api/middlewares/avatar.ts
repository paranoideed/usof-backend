import type { Request, Response, NextFunction } from "express";
import multer from "multer";

declare global {
    namespace Express {
        interface Request {
            file?: Express.Multer.File;
        }
    }
}


const uploader = multer({
    storage: multer.memoryStorage(),
}).single("avatar");

export default function uploadAvatarMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    uploader(req, res, (err?: any) => {
        if (!err) {
            if (!req.file) {
                return res.status(400).json({ message: "File 'avatar' is required" });
            }
            return next();
        }

        return res.status(400).json({ message: err.message || "Upload error" });
    });
}
