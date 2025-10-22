// src/storage/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import config from "../utils/config";

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

export function avatarKey(userId: string) {
    return `user/${userId}/avatar.png`;
}

export async function putUserAvatarPNG(userId: string, data: Buffer) {
    const key = avatarKey(userId);
    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: "image/png",
        CacheControl: "public, max-age=31536000, immutable",
        // ACL: "public-read", // если бакет/политики позволяют публичный доступ
    }));
    return { key, url: `${publicBase}/${key}` };
}
