/**
 * WhatsApp Cloud API Integration Service
 * Handles sending template and text messages via Meta's Graph API.
 */

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
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
}

/**
 * Validates environment variables before attempting an API call
 */
function checkEnvironment() {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        console.error("Missing WhatsApp Environment Variables. Ensure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set.");
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
    components = []
}: SendTemplateOptions) {
    if (!checkEnvironment()) throw new Error("WhatsApp API not configured locally");

    // Clean phone number (WhatsApp API expects just the digits, no '+')
    const cleanPhone = to.replace(/[^0-9]/g, "");

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

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
                "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
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
export async function sendTextMessage(to: string, message: string) {
    if (!checkEnvironment()) throw new Error("WhatsApp API not configured locally");

    const cleanPhone = to.replace(/[^0-9]/g, "");

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

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
                "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
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
