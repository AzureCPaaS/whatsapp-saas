/**
 * WhatsApp Cloud API Integration Service
 * Handles sending template and text messages via Meta's Graph API.
 */

const GRAPH_API_VERSION = "v21.0"; // Current Meta Graph API version

export interface TemplateComponent {
    type: "header" | "body" | "button";
    parameters: any[];
}

export interface SendTemplateOptions {
    to: string;
    templateName: string;
    languageCode?: string;
    components?: TemplateComponent[];
    phoneNumberId: string;
    accessToken: string;
}

/**
 * Validates credentials before attempting an API call
 */
function checkCredentials(phoneNumberId?: string, accessToken?: string) {
    if (!phoneNumberId || !accessToken) {
        console.error("Missing WhatsApp Credentials. User has not configured their settings.");
        return false;
    }
    return true;
}

/**
 * Sends a WhatsApp Template Message
 */
export async function sendTemplateMessage({
    to,
    templateName,
    languageCode = "en_US",
    components = [],
    phoneNumberId,
    accessToken
}: SendTemplateOptions) {
    if (!checkCredentials(phoneNumberId, accessToken)) throw new Error("WhatsApp credentials not configured");

    // Clean phone number (WhatsApp API expects just the digits, no '+')
    const cleanPhone = to.replace(/[^0-9]/g, "");

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: languageCode
            },
            components: components
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("WhatsApp API Error Response Raw Data:", JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || "Failed to send WhatsApp message");
        }

        return data; // Usually contains messaging_product: "whatsapp", contacts: [...], messages: [...]
    } catch (error) {
        console.error("Error sending WhatsApp Template:", error);
        throw error;
    }
}

/**
 * Sends a standard WhatsApp Text Message (Requires a 24-hour service window)
 */
export async function sendTextMessage(to: string, message: string, phoneNumberId: string, accessToken: string) {
    if (!checkCredentials(phoneNumberId, accessToken)) throw new Error("WhatsApp credentials not configured");

    const cleanPhone = to.replace(/[^0-9]/g, "");

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
            preview_url: false,
            body: message
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("WhatsApp API Error Response:", data);
            throw new Error(data.error?.message || "Failed to send WhatsApp message");
        }

        return data;
    } catch (error) {
        console.error("Error sending WhatsApp Text:", error);
        throw error;
    }
}
