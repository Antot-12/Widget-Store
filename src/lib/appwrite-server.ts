// appwrite-server.ts
// FOR SERVER-SIDE USE ONLY

import { Client as ServerClient, Databases as ServerDatabases } from 'node-appwrite';

// Pull from process.env
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const appwriteApiKey = process.env.APPWRITE_API_KEY!;

export const WIDGETS_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const COMMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!;
export const SITE_SETTINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SITE_SETTINGS_COLLECTION_ID!;
export const FAQ_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FAQ_COLLECTION_ID!;
export const CATEGORIES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!;


// --------------------
// Server-side Appwrite (for use in Next.js server actions / API routes) - Uses API Key
// --------------------
const serverClient = new ServerClient()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(appwriteApiKey);

export const serverDatabases = new ServerDatabases(serverClient);
