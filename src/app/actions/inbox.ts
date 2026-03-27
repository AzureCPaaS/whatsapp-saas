"use server";

import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getCurrentUserId } from "./dashboard";
import { sendTextMessage } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export async function getConversations() {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized");

    // Fetch all messages for the workspace
    const allMessages = await db.query.messages.findMany({
        where: eq(messages.workspaceId, userId),
        orderBy: [desc(messages.createdAt)],
    });

    // Group by contact phone to find the latest message per conversation
    const conversationsMap = new Map<string, typeof allMessages[0]>();

    for (const msg of allMessages) {
        if (!conversationsMap.has(msg.contactPhone)) {
            conversationsMap.set(msg.contactPhone, msg);
        }
    }

    return Array.from(conversationsMap.values());
}

export async function getMessages(contactPhone: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized");

    const chatHistory = await db.query.messages.findMany({
        where: and(
            eq(messages.workspaceId, userId),
            eq(messages.contactPhone, contactPhone)
        ),
        orderBy: [desc(messages.createdAt)],
    });

    // Return in chronological order (oldest first for chat UI)
    return chatHistory.reverse();
}

export async function sendReply(contactPhone: string, content: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized");

    if (!content.trim()) throw new Error("Message content cannot be empty");

    // Send via WhatsApp Graph API
    await sendTextMessage(contactPhone, content);

    // Provide immediate optimistic response, relying on webhook to log 'sent' or 'delivered' 
    // In a production environment, you might want to proactively insert a 'pending' message here
    // but the Meta webhook will bounce back our inbound message receipt rapidly.

    // For better UX, we'll insert it proactively so it appears instantly.
    await db.insert(messages).values({
        workspaceId: userId,
        contactPhone,
        direction: "outbound",
        type: "text",
        content,
        status: "sent"
    });

    revalidatePath("/dashboard/inbox");

    return { success: true };
}
