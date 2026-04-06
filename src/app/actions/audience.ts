"use server";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { contacts, contactGroups } from "@/db/schema";
import { getCurrentUserId } from "./dashboard";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ContactImportRecord = {
    name: string;
    phone: string;
    tags: string[];
};

export async function bulkAddContacts(records: ContactImportRecord[]) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    if (!records || records.length === 0) {
        throw new Error("No records provided");
    }

    // Map records to the database schema, adding the workspaceId and default status
    const valuesToInsert = records.map(record => ({
        workspaceId: userId,
        name: record.name,
        // Ensure phone starts with '+'
        phone: record.phone.startsWith("+") ? record.phone : `+${record.phone}`,
        tags: record.tags,
        status: "subscribed"
    }));

    try {
        // Perform a bulk insert.
        // onConflictDoNothing ensures that if a phone number already exists
        // (due to the unique constraint), that specific row is simply ignored
        // without crashing the entire batch operation.
        await db.insert(contacts)
            .values(valuesToInsert)
            .onConflictDoNothing({ target: contacts.phone });

        revalidatePath("/dashboard/audience");
        return { success: true, count: valuesToInsert.length };

    } catch (e: any) {
        console.error("Error bulk adding contacts:", e);
        return { success: false, error: e.message };
    }
}

export async function deleteContact(contactId: string) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    try {
        await db.delete(contacts)
            .where(
                and(
                    eq(contacts.id, contactId),
                    eq(contacts.workspaceId, userId)
                )
            );

        return { success: true };
    } catch (e: any) {
        console.error("Error deleting contact:", e);
        return { success: false, error: e.message };
    }
}

export async function updateContact(contactId: string, formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/login");

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const groupIdsInput = formData.getAll("groupIds") as string[];

    try {
        await db.update(contacts)
            .set({ name, phone })
            .where(
                and(
                    eq(contacts.id, contactId),
                    eq(contacts.workspaceId, userId)
                )
            );

        await db.delete(contactGroups).where(eq(contactGroups.contactId, contactId));

        if (groupIdsInput && groupIdsInput.length > 0) {
            const mappings = groupIdsInput.map(gId => ({
                contactId: contactId,
                groupId: gId
            }));
            await db.insert(contactGroups).values(mappings);
        }

        return { success: true };
    } catch (e: any) {
        console.error("Error updating contact:", e);
        return { success: false, error: e.message };
    }
}
