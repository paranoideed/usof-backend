// src/storage/s3.ts
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand // 1. Импортируем команду удаления
} from "@aws-sdk/client-s3";
import config from "../../utils/config";

const region = config.aws.region!;
const bucket = config.aws.bucket_name!;
const publicBase =
    config.aws.public_base ?? `https://${bucket}.s3.${region}.amazonaws.com`;

export const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId:     config.aws.access_key_id!,
        secretAccessKey: config.aws.secret_access_key!,
    },
});

// 2. Удаляем старую функцию avatarKey(userId), она больше не нужна.

/**
 * Загружает аватар пользователя, генерируя УНИКАЛЬНОЕ имя файла.
 * @returns { key: string, url: string } - Ключ объекта в S3 и публичный URL.
 */
export async function putUserAvatar(
    userId: string,
    data: Buffer,
    contentType: string,
): Promise<{ key: string; url: string }> { // 3. Обновляем возврат

    // 4. Генерируем уникальный ключ, используя timestamp
    const key = `user/${userId}/avatar_${Date.now()}`;

    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key, // Используем новый уникальный ключ
        Body: data,
        ContentType: contentType,
        // Эта политика кэширования идеальна для уникальных имен
        CacheControl: "public, max-age=31536000, immutable",
    }));

    // 5. Формируем и возвращаем полный URL и ключ
    const url = `${publicBase}/${key}`;
    return { key, url };
}

/**
 * Удаляет объект из S3 по его ключу.
 */
export async function deleteS3Object(key: string) {
    try {
        await s3.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
    } catch (err) {
        // Логгируем ошибку, но не прерываем выполнение
        console.error(`[S3 Delete Error] Failed to delete key: ${key}`, err);
    }
}

/**
 * Извлекает ключ объекта S3 из его публичного URL.
 */
export function getKeyFromUrl(url: string): string | null {
    if (!url || !url.startsWith(publicBase)) {
        return null;
    }
    // +1 чтобы убрать первый слэш /
    return url.substring(publicBase.length + 1);
}