// appwrite.ts
// FOR CLIENT-SIDE USE ONLY

import { Client, Databases, Account } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Check if environment variables are loaded
if (!endpoint || !projectId) {
    throw new Error("Appwrite environment variables (endpoint or project ID) are not configured. Please check your .env file.");
}

const client = new Client();
client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);

// Export IDs for use in components, ensuring they are not undefined.
export const WIDGETS_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const COMMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!;

if (!WIDGETS_DB_ID || !COMMENTS_COLLECTION_ID) {
    console.error("Appwrite database or collection ID environment variables are missing.");
}
