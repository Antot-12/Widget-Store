
"use server";
import type { WidgetOfTheDay, SiteSettings, FaqItem, CategoryItem } from "@/lib/types";
import { ALL_WIDGETS } from "@/app/data";
import { serverDatabases, WIDGETS_DB_ID, SITE_SETTINGS_COLLECTION_ID, FAQ_COLLECTION_ID, CATEGORIES_COLLECTION_ID } from "@/lib/appwrite-server";
import { Query, ID } from "node-appwrite";

export async function getWidgetOfTheDay(): Promise<WidgetOfTheDay | null> {
    try {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        const widgetIndex = dayOfYear % ALL_WIDGETS.length;
        const selectedWidget = ALL_WIDGETS[widgetIndex];
        
        return {
            widget: selectedWidget,
            reason: "A standout choice for its innovative features and user-friendly design."
        };
    } catch (error) {
        console.error("Error fetching widget of the day:", error);
        return null;
    }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
    try {
        const response = await serverDatabases.listDocuments(
            WIDGETS_DB_ID,
            SITE_SETTINGS_COLLECTION_ID,
            [Query.equal('key', 'default-settings')]
        );

        if (response.documents.length > 0) {
            const doc = response.documents[0];
            return {
                $id: doc.$id,
                email: doc.email,
                address: doc.address,
                phone: doc.phone,
                website: doc.website,
                facebook: doc.facebook,
                twitter: doc.twitter,
                github: doc.github,
                linkedin: doc.linkedin,
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return null;
    }
}

export async function createSiteSettings(settings: Omit<SiteSettings, '$id'>): Promise<{success: boolean}> {
    try {
        await serverDatabases.createDocument(
            WIDGETS_DB_ID,
            SITE_SETTINGS_COLLECTION_ID,
            ID.unique(),
            {
                ...settings,
                key: 'default-settings' // Ensure the key is set
            }
        );
        return { success: true };
    } catch (error) {
        console.error("Error creating site settings:", error);
        return { success: false };
    }
}

export async function updateSiteSettings(settings: Omit<SiteSettings, '$id'> & { documentId: string }): Promise<{success: boolean}> {
    try {
        const { documentId, ...dataToUpdate } = settings;
        await serverDatabases.updateDocument(
            WIDGETS_DB_ID,
            SITE_SETTINGS_COLLECTION_ID,
            documentId,
            dataToUpdate
        );
        return { success: true };
    } catch (error) {
        console.error("Error updating site settings:", error);
        return { success: false };
    }
}

// --- FAQ Actions ---
export async function getFaqs(): Promise<FaqItem[]> {
    try {
        if (!WIDGETS_DB_ID || !FAQ_COLLECTION_ID) {
            console.warn("FAQ Collection ID or DB ID is not set in server environment variables.");
            return [];
        }
        const response = await serverDatabases.listDocuments(
            WIDGETS_DB_ID,
            FAQ_COLLECTION_ID
        );
        return response.documents.map(doc => ({
            ...doc,
            question: doc.question,
            answer: doc.answer
        })) as FaqItem[];
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        return [];
    }
}

export async function createFaq(faq: { question: string; answer: string; }): Promise<{success: boolean, document?: FaqItem}> {
    try {
        const document = await serverDatabases.createDocument(
            WIDGETS_DB_ID,
            FAQ_COLLECTION_ID,
            ID.unique(),
            faq
        );
        return { success: true, document: document as FaqItem };
    } catch (error) {
        console.error("Error creating FAQ:", error);
        return { success: false };
    }
}

export async function updateFaq(faq: { documentId: string, question: string; answer: string; }): Promise<{success: boolean, document?: FaqItem}> {
    try {
        const { documentId, ...dataToUpdate } = faq;
        const document = await serverDatabases.updateDocument(
            WIDGETS_DB_ID,
            FAQ_COLLECTION_ID,
            documentId,
            dataToUpdate
        );
        return { success: true, document: document as FaqItem };
    } catch (error) {
        console.error("Error updating FAQ:", error);
        return { success: false };
    }
}

export async function deleteFaq(documentId: string): Promise<{success: boolean}> {
    try {
        await serverDatabases.deleteDocument(
            WIDGETS_DB_ID,
            FAQ_COLLECTION_ID,
            documentId
        );
        return { success: true };
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        return { success: false };
    }
}


// --- Category Actions ---

export async function getCategories(): Promise<CategoryItem[]> {
    try {
        if (!WIDGETS_DB_ID || !CATEGORIES_COLLECTION_ID) {
            console.warn("Categories Collection ID or DB ID is not set in server environment variables.");
            return [];
        }
        const response = await serverDatabases.listDocuments(WIDGETS_DB_ID, CATEGORIES_COLLECTION_ID);
        return response.documents.map(doc => ({
            ...doc,
            name: doc.name
        })) as CategoryItem[];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function createCategory(category: { name: string }): Promise<{success: boolean, document?: CategoryItem}> {
    try {
        const document = await serverDatabases.createDocument(
            WIDGETS_DB_ID,
            CATEGORIES_COLLECTION_ID,
            ID.unique(),
            category
        );
        return { success: true, document: document as CategoryItem };
    } catch (error) {
        console.error("Error creating category:", error);
        return { success: false };
    }
}

export async function updateCategory(category: { documentId: string, name: string }): Promise<{success: boolean, document?: CategoryItem}> {
    try {
        const { documentId, ...dataToUpdate } = category;
        const document = await serverDatabases.updateDocument(
            WIDGETS_DB_ID,
            CATEGORIES_COLLECTION_ID,
            documentId,
            dataToUpdate
        );
        return { success: true, document: document as CategoryItem };
    } catch (error) {
        console.error("Error updating category:", error);
        return { success: false };
    }
}

export async function deleteCategory(documentId: string): Promise<{success: boolean}> {
    try {
        await serverDatabases.deleteDocument(
            WIDGETS_DB_ID,
            CATEGORIES_COLLECTION_ID,
            documentId
        );
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { success: false };
    }
}
