import { createClient } from "@supabase/supabase-js";
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export function getImageUrl(filename: string | null): string | null {
  if (!filename) return null;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  if (!accountName || !accountKey || !containerName) return null;

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: filename,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: new Date(Date.now() + 60 * 60 * 1000),
    },
    credential
  ).toString();

  return `https://${accountName}.blob.core.windows.net/${containerName}/${filename}?${sasToken}`;
}

export type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  image_filename: string | null;
  published_at: string;
  created_at: string;
};
