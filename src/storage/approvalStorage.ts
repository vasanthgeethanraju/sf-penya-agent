import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import type { ApprovalPackage } from "../approval/approvalTypes";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_DATA_BUCKET_NAME;

if (
  !accountId ||
  !accessKeyId ||
  !secretAccessKey ||
  !bucketName
) {
  throw new Error(
    "Missing R2 approval storage environment variables"
  );
}

const r2 = new S3Client({
  region: "auto",

  endpoint:
    `https://${accountId}.r2.cloudflarestorage.com`,

  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function saveApprovalPackage(
  approvalPackage: ApprovalPackage
): Promise<void> {
  const key =
    `approvals/${approvalPackage.id}.json`;

  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,

      Body: JSON.stringify(
        approvalPackage,
        null,
        2
      ),

      ContentType: "application/json",
    })
  );
}

export async function loadApprovalPackage(
  approvalId: string
): Promise<ApprovalPackage | null> {
  const key =
    `approvals/${approvalId}.json`;

  try {
    const response = await r2.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    if (!response.Body) {
      return null;
    }

    const json =
      await response.Body.transformToString();

    return JSON.parse(json) as ApprovalPackage;
  } catch (error: any) {
    if (
      error?.name === "NoSuchKey" ||
      error?.$metadata?.httpStatusCode === 404
    ) {
      return null;
    }

    throw error;
  }
}