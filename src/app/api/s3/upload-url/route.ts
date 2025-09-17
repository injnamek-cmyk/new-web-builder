import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Missing filename or contentType" },
        { status: 400 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: filename,
      ContentType: contentType,
    });

    // Presigned URL은 10분 동안 유효합니다.
    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error creating presigned URL", error);
    return NextResponse.json(
      { error: "Error creating presigned URL" },
      { status: 500 }
    );
  }
}
