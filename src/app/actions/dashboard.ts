"use server";

import { db } from "@/db";
import { users, contacts, campaigns, messages, contactGroups, groups } from "@/db/schema";
import { eq, count, desc, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Helper to get current user ID
export async function getCurrentUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("ws_session")?.value;

    if (!sessionId) redirect("/login");

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, sessionId)
        });
        if (user) return user.id;

        cookieStore.delete("ws_session");
        redirect("/login");
    } catch {
        cookieStore.delete("ws_session");
        redirect("/login");
    }
}

export async function getDashboardStats() {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const totalAudienceResult = await db.select({ count: count() }).from(contacts).where(eq(contacts.workspaceId, userId));
    const totalCampaignsResult = await db.select({ count: count() }).from(campaigns).where(eq(campaigns.workspaceId, userId));

    const totalAudience = totalAudienceResult[0].count;
    const totalCampaigns = totalCampaignsResult[0].count;

    const messagesStats = await db.select({
        status: messages.status,
        count: count()
    })
        .from(messages)
        .where(eq(messages.workspaceId, userId))
        .groupBy(messages.status);

    let totalAttempted = 0;
    let totalFailed = 0;

    messagesStats.forEach(stat => {
        const c = Number(stat.count);
        totalAttempted += c;
        if (stat.status === 'failed') totalFailed += c;
    });

    const totalSuccess = totalAttempted - totalFailed;
    let deliveryRateNum = 100;
    if (totalAttempted > 0) {
        deliveryRateNum = Math.round((totalSuccess / totalAttempted) * 100);
    }

    return {
        messagesSent: totalAttempted.toString(),
        totalAudience: totalAudience.toString(),
        deliveryRate: `${deliveryRateNum}%`,
        currentSpend: "$0.00",
    };
}

export async function getRecentCampaigns() {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const recentCampaigns = await db.query.campaigns.findMany({
        where: eq(campaigns.workspaceId, userId),
        orderBy: [desc(campaigns.createdAt)],
        limit: 5,
    });

    return recentCampaigns;
}

export async function getAudienceContacts() {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const audience = await db.query.contacts.findMany({
        where: eq(contacts.workspaceId, userId),
        orderBy: [desc(contacts.createdAt)],
    });

    const workspaceGroups = await db.query.groups.findMany({ where: eq(groups.workspaceId, userId) });
    const GroupIds = workspaceGroups.map(g => g.id);
    let mappings: { contactId: string, groupId: string }[] = [];

    if (GroupIds.length > 0) {
        mappings = await db.select().from(contactGroups).where(inArray(contactGroups.groupId, GroupIds));
    }

    return audience.map(c => {
        const myGroups = mappings.filter(m => m.contactId === c.id).map(m => m.groupId);
        return { ...c, groupIds: myGroups };
    });
}

export async function addContact(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const groupIdsInput = formData.getAll("groupIds") as string[];

    if (!name || !phone) throw new Error("Name and phone are required");

    // Basic cleaning of phone number
    const cleanPhone = phone.startsWith("+") ? phone : `+${phone}`;

    const [newContact] = await db.insert(contacts).values({
        workspaceId: userId,
        name,
        phone: cleanPhone,
        tags: [],
        status: "subscribed"
    }).returning();

    if (groupIdsInput && groupIdsInput.length > 0) {
        const mappings = groupIdsInput.map(gId => ({
            contactId: newContact.id,
            groupId: gId
        }));
        await db.insert(contactGroups).values(mappings);
    }

    return { success: true };
}
