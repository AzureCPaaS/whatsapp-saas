"use server";

import { getCurrentUserId } from "./dashboard";
import { revalidatePath } from "next/cache";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAAQu9ZBaeeggBQwzxsTYAXUZBq5p4cn1ZBfoQwfjwzHAW94Rqf1d0bdl3Og3oEJLRyGDNaxyGnJhgL78xykWVAJxqmZBAlyZB2V1LDaGSuQZBLvcb3L3gIdIOnxZCzd6CAetxsucOWNd1KNgwXfgg1NCgZBfjlxcYhvi7hZAVK2VRjgiLkP5ISoOyyHjyIXtYi5MJ7RiaZB0VZAJ05AwKKJjjZA0gmEhQ0NEYMjz1Mm1";
const WABA_ID = process.env.WABA_ID || "1603502447653110";
const GRAPH_API_VERSION = "v21.0"; // Current Meta Graph API version

// Fetch approved WhatsApp message templates from Meta Graph API
export async function getWhatsAppTemplates(status?: "APPROVED" | "PENDING" | "REJECTED" | "ALL") {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized");

    try {
        let url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WABA_ID}/message_templates`;
        if (status && status !== "ALL") {
            url += `?status=${status}`;
        }

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            },
            // Do not cache so we get fresh data when creating/deleting templates
            cache: "no-store"
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Meta API Template Fetch Error:", errBody);
            throw new Error(`Failed to fetch templates: ${response.statusText}`);
        }

        const data = await response.json();

        // Map required fields for the UI
        return data.data.map((tmpl: any) => ({
            id: tmpl.id,
            name: tmpl.name,
            language: tmpl.language,
            category: tmpl.category,
            status: tmpl.status,
            components: tmpl.components
        }));

    } catch (e: any) {
        console.error("Error fetching templates:", e);
        return [];
    }
}

// Create a new WhatsApp Text Template
export async function createWhatsAppTemplate(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const category = formData.get("category") as string || "MARKETING";
    const language = formData.get("language") as string || "en_US";
    const bodyText = formData.get("bodyText") as string;

    // Optional components
    const headerText = formData.get("headerText") as string;
    const footerText = formData.get("footerText") as string;

    if (!name || !bodyText) {
        throw new Error("Template name and body text are required");
    }

    // Prepare components array
    const components: any[] = [
        {
            type: "BODY",
            text: bodyText
        }
    ];

    if (headerText) {
        components.push({
            type: "HEADER",
            format: "TEXT",
            text: headerText
        });
    }

    if (footerText) {
        components.push({
            type: "FOOTER",
            text: footerText
        });
    }

    const payload = {
        name,
        language,
        category,
        components
    };

    try {
        const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WABA_ID}/message_templates`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Meta API Template Create Error:", data);
            throw new Error(data.error?.error_user_msg || data.error?.message || "Failed to create template");
        }

        revalidatePath("/dashboard/templates");
        return { success: true, templateId: data.id };
    } catch (e: any) {
        console.error("Error creating template:", e);
        throw e;
    }
}

// Delete a WhatsApp Template
export async function deleteWhatsAppTemplate(templateName: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized");

    if (!templateName) throw new Error("Template name is required");

    try {
        const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WABA_ID}/message_templates?name=${templateName}`;
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_TOKEN}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Meta API Template Delete Error:", data);
            throw new Error(data.error?.message || "Failed to delete template");
        }

        revalidatePath("/dashboard/templates");
        return { success: true };
    } catch (e: any) {
        console.error("Error deleting template:", e);
        throw e;
    }
}
