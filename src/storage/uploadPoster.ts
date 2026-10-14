import fs from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

if (
  !accountId ||
  !accessKeyId ||
  !secretAccessKey ||
  !bucketName ||
  !publicBaseUrl
) {
  throw new Error("Missing R2 environment variables");
}

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadPoster(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);

  const fileName = path.basename(filePath);
  const objectKey = `posters/${Date.now()}-${fileName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: "image/png",
    })
  );

  return `${publicBaseUrl}/${objectKey}`;
}