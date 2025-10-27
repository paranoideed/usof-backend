import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
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

export async function putUserAvatar(
    userId: string,
    data: Buffer,
    contentType: string,
): Promise<{ key: string; url: string }> {

    const key = `user/${userId}/avatar_${Date.now()}`;

    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
    }));

    const url = `${publicBase}/${key}`;
    return { key, url };
}

export async function deleteS3Object(key: string) {
    try {
        await s3.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
    } catch (err) {
        console.error(`[S3 Delete Error] Failed to delete key: ${key}`, err);
    }
}

export function getKeyFromUrl(url: string): string | null {
    if (!url || !url.startsWith(publicBase)) {
        return null;
    }
    return url.substring(publicBase.length + 1);
}