"use server";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { groups, contactGroups } from "@/db/schema";
import { getCurrentUserId } from "./dashboard";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string || "";

    if (!name) return { success: false, error: "Group name is required" };

    try {
        await db.insert(groups).values({
            workspaceId: userId,
            name,
            description
        });
        revalidatePath("/dashboard/groups");
        return { success: true };
    } catch (e: any) {
        console.error("Error creating group:", e);
        return { success: false, error: e.message };
    }
}

export async function getGroupsAndCounts() {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const userGroups = await db.query.groups.findMany({
        where: eq(groups.workspaceId, userId),
        orderBy: (groups, { asc }) => [asc(groups.name)]
    });

    const counts = await db
        .select({
            groupId: contactGroups.groupId,
            count: sql<number>`count(*)::int`
        })
        .from(contactGroups)
        .groupBy(contactGroups.groupId);

    const countMap = new Map(counts.map(g => [g.groupId, g.count]));

    return userGroups.map(g => ({
        ...g,
        count: countMap.get(g.id) || 0
    }));
}

export async function deleteGroup(groupId: string) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    try {
        await db.delete(groups).where(and(eq(groups.id, groupId), eq(groups.workspaceId, userId)));
        revalidatePath("/dashboard/groups");
        revalidatePath("/dashboard/audience");
        return { success: true };
    } catch (e: any) {
        console.error("Error deleting group:", e);
        return { success: false, error: e.message };
    }
}

export async function updateGroup(groupId: string, formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const name = formData.get("name") as string;

    try {
        await db.update(groups).set({ name }).where(and(eq(groups.id, groupId), eq(groups.workspaceId, userId)));
        revalidatePath("/dashboard/groups");
        revalidatePath("/dashboard/audience");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
