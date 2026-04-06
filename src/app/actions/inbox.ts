"use server";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getCurrentUserId } from "./dashboard";
import { sendTextMessage } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export async function getConversations() {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

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
    if (!userId) redirect("/login");

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
    const standardizedPhone = contactPhone.replace(/^\+/, "");

    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    if (!content.trim()) throw new Error("Message content cannot be empty");

    const currentUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!currentUser?.phone_number_id || !currentUser?.whatsapp_token) {
        return { error: "WhatsApp credentials not configured." };
    }

    // Send via WhatsApp Graph API
    await sendTextMessage(standardizedPhone, content, currentUser.phone_number_id, currentUser.whatsapp_token);
    // but the Meta webhook will bounce back our inbound message receipt rapidly.

    // For better UX, we'll insert it proactively so it appears instantly.
    await db.insert(messages).values({
        workspaceId: userId,
        contactPhone: standardizedPhone,
        direction: "outbound",
        type: "text",
        content,
        status: "sent"
    });

    revalidatePath("/dashboard/inbox");

    return { success: true };
}
