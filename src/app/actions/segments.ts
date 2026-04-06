"use server";

import { db } from "@/db";
import { contacts } from "@/db/schema";
import { getCurrentUserId } from "./dashboard";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function renameSegment(oldTag: string, newTag: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized");

    try {
        const userContacts = await db.query.contacts.findMany({
            where: eq(contacts.workspaceId, userId)
        });

        for (const contact of userContacts) {
            const currentTags = contact.tags || [];
            if (currentTags.includes(oldTag)) {
                const updatedTags = currentTags.map(t => t === oldTag ? newTag : t);
                const uniqueTags = Array.from(new Set(updatedTags));

                await db.update(contacts)
                    .set({ tags: uniqueTags })
                    .where(eq(contacts.id, contact.id));
            }
        }

        revalidatePath("/dashboard/audience");
        return { success: true };
    } catch (e: any) {
        console.error("Error renaming segment:", e);
        return { success: false, error: e.message };
    }
}

export async function deleteSegment(tagToRemove: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized");

    try {
        const userContacts = await db.query.contacts.findMany({
            where: eq(contacts.workspaceId, userId)
        });

        for (const contact of userContacts) {
            const currentTags = contact.tags || [];
            if (currentTags.includes(tagToRemove)) {
                const updatedTags = currentTags.filter(t => t !== tagToRemove);

                await db.update(contacts)
                    .set({ tags: updatedTags })
                    .where(eq(contacts.id, contact.id));
            }
        }

        revalidatePath("/dashboard/audience");
        return { success: true };
    } catch (e: any) {
        console.error("Error deleting segment:", e);
        return { success: false, error: e.message };
    }
}
