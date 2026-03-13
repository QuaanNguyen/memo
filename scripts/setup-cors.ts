import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

if (!accountName || !accountKey) {
  console.error("Set AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY in .env.local");
  process.exit(1);
}

const credential = new StorageSharedKeyCredential(accountName, accountKey);
const client = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  credential
);

await client.setProperties({
  cors: [
    {
      allowedOrigins: "http://localhost:3000",
      allowedMethods: "GET,PUT,DELETE,HEAD,OPTIONS",
      allowedHeaders: "Content-Type,x-ms-blob-type",
      exposedHeaders: "",
      maxAgeInSeconds: 3600,
    },
  ],
});

console.log("CORS rules set on Azure Storage account.");
