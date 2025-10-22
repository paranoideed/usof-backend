import type { Request, Response, NextFunction } from "express";
import multer from "multer";

// --- типовое расширение Request, чтобы TS знал про req.file ---
declare global {
    // @types/multer добавляет namespace Express.Multer
    namespace Express {
        interface Request {
            file?: Express.Multer.File;
        }
    }
}

// 10 MB
const MAX_SIZE = 10 * 1024 * 1024;

// Готовим инстанс multer один раз
const uploader = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
        // строго PNG
        if (file.mimetype !== "image/png") {
            // пробросим контролируемую ошибку
            const err: any = new Error("Only image/png allowed");
            err.code = "UNSUPPORTED_TYPE";
            return cb(err);
        }
        cb(null, true);
    },
}).single("avatar"); // поле файла должно называться "avatar"

// Экспортируем как обычный express-миддлвар (в твоём формате)
export default function uploadAvatarMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    uploader(req, res, (err?: any) => {
        if (!err) {
            // Доп.проверка на всякий (если fileFilter выключат)
            if (!req.file) {
                return res.status(400).json({ message: "File 'avatar' is required" });
            }
            if (req.file.mimetype !== "image/png") {
                return res.status(415).json({ message: "Only PNG is allowed" });
            }
            if (req.file.size > MAX_SIZE) {
                return res.status(413).json({ message: "Max size is 10MB" });
            }
            return next();
        }

        // Карта типичных ошибок multer -> HTTP коды
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ message: "Max size is 10MB" });
        }
        if (err.code === "UNSUPPORTED_TYPE") {
            return res.status(415).json({ message: "Only PNG is allowed" });
        }

        // Некорректное поле / прочее
        return res.status(400).json({ message: err.message || "Upload error" });
    });
}
