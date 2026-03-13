import { NextRequest, NextResponse } from "next/server";
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;

export async function POST(req: NextRequest) {
  if (!accountName || !accountKey || !containerName) {
    return NextResponse.json(
      { error: "Azure storage not configured" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.filename || !body?.contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    );
  }

  const { filename, contentType } = body as {
    filename: string;
    contentType: string;
  };

  const blobName = `${Date.now()}-${filename}`;

  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  const expiresOn = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("cw"), // create + write
      expiresOn,
      contentType,
    },
    credential
  ).toString();

  const uploadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

  return NextResponse.json({ uploadUrl, blobName });
}
