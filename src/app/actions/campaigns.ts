"use server";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { campaigns, messages, contacts } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getCurrentUserId, getAudienceContacts } from "./dashboard";
import { sendTemplateMessage, sendTextMessage } from "@/lib/whatsapp";

import { users } from "@/db/schema";

// Fetch a single campaign's core details
export async function getCampaignDetails(campaignId: string) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const campaign = await db.query.campaigns.findFirst({
        where: and(
            eq(campaigns.id, campaignId),
            eq(campaigns.workspaceId, userId)
        )
    });

    if (!campaign) throw new Error("Campaign not found");
    return campaign;
}

// Aggregate delivery statuses (sent/delivered/read/failed)
export async function getCampaignMetrics(campaignId: string) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    // We can use a raw SQL aggregation or Drizzle's aggregate functions
    const results = await db
        .select({
            status: messages.status,
            count: sql<number>`count(*)::int`
        })
        .from(messages)
        .where(
            and(
                eq(messages.workspaceId, userId),
                eq(messages.campaignId, campaignId)
            )
        )
        .groupBy(messages.status);

    const metrics = {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        total: 0
    };

    results.forEach(row => {
        metrics.total += row.count;
        if (row.status === 'sent') metrics.sent += row.count;
        if (row.status === 'delivered') metrics.delivered += row.count;
        if (row.status === 'read') metrics.read += row.count;
        if (row.status === 'failed') metrics.failed += row.count;
    });

    return metrics;
}

// Fetch detailed recipient list by joining messages and contacts
export async function getCampaignRecipients(campaignId: string) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const recipients = await db
        .select({
            id: messages.id,
            status: messages.status,
            createdAt: messages.createdAt,
            phone: messages.contactPhone,
            name: contacts.name,
        })
        .from(messages)
        .leftJoin(contacts, eq(messages.contactPhone, contacts.phone))
        .where(
            and(
                eq(messages.workspaceId, userId),
                eq(messages.campaignId, campaignId)
            )
        )
        .orderBy(desc(messages.createdAt));

    return recipients;
}



export async function createAndSendBroadcast(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const name = formData.get("name") as string;
    const templateName = formData.get("templateName") as string;
    const templateLanguage = formData.get("templateLanguage") as string || "en_US";
    const segmentTarget = formData.get("segmentTarget") as string;

    if (!name || !templateName) throw new Error("Campaign name and template are required");

    const currentUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!currentUser?.phone_number_id || !currentUser?.whatsapp_token) {
        return { error: "WhatsApp credentials not configured. Please update your settings." };
    }

    // 1. Fetch targeted contacts with associated group metrics
    const allContacts = await getAudienceContacts();

    const targetAudience = segmentTarget
        ? allContacts.filter((c: any) => c.groupIds?.includes(segmentTarget))
        : allContacts;

    if (targetAudience.length === 0) {
        throw new Error("No contacts found matched the selected segment to send to.");
    }

    // 2. Create a campaign record in the database
    const [newCampaign] = await db.insert(campaigns).values({
        workspaceId: userId,
        name,
        templateName,
        audienceCount: targetAudience.length.toString(),
        status: "sending"
    }).returning();

    // 3. Dispatch template messages
    let successCount = 0;
    let failCount = 0;

    // Use Promise.allSettled for concurrent sending (careful with rate limits in prod)
    const sendPromises = targetAudience.map(async (contact) => {
        try {
            const result = await sendTemplateMessage({
                to: contact.phone,
                templateName: templateName,
                languageCode: templateLanguage,
                phoneNumberId: currentUser.phone_number_id!,
                accessToken: currentUser.whatsapp_token!
            });

            // Log the outbound message to the database to track its delivery status later
            await db.insert(messages).values({
                workspaceId: userId,
                contactPhone: contact.phone,
                direction: "outbound",
                type: "template",
                content: templateName,
                status: "sent",
                campaignId: newCampaign.id,
            });

            return result;
        } catch (error) {
            await db.insert(messages).values({
                workspaceId: userId,
                contactPhone: contact.phone,
                direction: "outbound",
                type: "template",
                content: templateName,
                status: "failed",
                campaignId: newCampaign.id,
            });
            throw error;
        }
    });

    const results = await Promise.allSettled(sendPromises);

    results.forEach(result => {
        if (result.status === "fulfilled") {
            successCount++;
        } else {
            failCount++;
            console.error("Failed to send message to contact:", result.reason);
        }
    });

    if (successCount === 0 && failCount > 0) {
        return { error: `Broadcast failed. All ${failCount} messages were rejected by Meta API. Check the server logs for the exact error.` };
    }

    console.log(`Campaign ${newCampaign.id} finished. Success: ${successCount}, Failed: ${failCount}`);

    // 4. Update campaign status to completed (or failed)
    await db.update(campaigns)
        .set({ status: successCount > 0 ? "completed" : "failed" })
        .where(eq(campaigns.id, newCampaign.id));

    return {
        success: true,
        campaignId: newCampaign.id,
        metrics: { successCount, failCount }
    };
}

export async function createAndSendCustomText(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const name = formData.get("name") as string;
    const messageText = formData.get("messageText") as string;
    const segmentTarget = formData.get("segmentTarget") as string;

    if (!name || !messageText) throw new Error("Campaign name and message text are required");

    const currentUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!currentUser?.phone_number_id || !currentUser?.whatsapp_token) {
        return { error: "WhatsApp credentials not configured. Please update your settings." };
    }

    // 1. Fetch targeted contacts with associated group metrics
    const allContacts = await getAudienceContacts();

    const targetAudience = segmentTarget
        ? allContacts.filter((c: any) => c.groupIds?.includes(segmentTarget))
        : allContacts;

    if (targetAudience.length === 0) {
        throw new Error("No contacts found matched the selected segment to send to.");
    }

    // 2. Create a campaign record in the database
    const [newCampaign] = await db.insert(campaigns).values({
        workspaceId: userId,
        name,
        templateName: "Custom Text",
        audienceCount: targetAudience.length.toString(),
        status: "sending"
    }).returning();

    // 3. Dispatch text messages
    let successCount = 0;
    let failCount = 0;

    const sendPromises = targetAudience.map(async (contact) => {
        try {
            const result = await sendTextMessage(contact.phone, messageText, currentUser.phone_number_id!, currentUser.whatsapp_token!);

            // Log the outbound message to the database
            await db.insert(messages).values({
                workspaceId: userId,
                contactPhone: contact.phone,
                direction: "outbound",
                type: "text",
                content: messageText,
                status: "sent",
                campaignId: newCampaign.id,
            });

            return result;
        } catch (error) {
            await db.insert(messages).values({
                workspaceId: userId,
                contactPhone: contact.phone,
                direction: "outbound",
                type: "text",
                content: messageText,
                status: "failed",
                campaignId: newCampaign.id,
            });
            throw error;
        }
    });

    const results = await Promise.allSettled(sendPromises);

    results.forEach(result => {
        if (result.status === "fulfilled") {
            successCount++;
        } else {
            failCount++;
            console.error("Failed to send custom text to contact:", result.reason);
        }
    });

    if (successCount === 0 && failCount > 0) {
        return { error: `Broadcast failed. All ${failCount} messages were rejected by Meta API. This often happens if the recipient has not messaged you in the last 24 hours. Check server logs for details.` };
    }

    // 4. Update campaign status
    await db.update(campaigns)
        .set({ status: successCount > 0 ? "completed" : "failed" })
        .where(eq(campaigns.id, newCampaign.id));

    return {
        success: true,
        campaignId: newCampaign.id,
        metrics: { successCount, failCount }
    };
}
