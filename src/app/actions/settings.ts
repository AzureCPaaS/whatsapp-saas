"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "./dashboard";
import { revalidatePath } from "next/cache";

export async function updateWhatsAppCredentials(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const phoneNumberId = formData.get("phoneNumberId") as string;
    const whatsappToken = formData.get("whatsappToken") as string;

    if (!phoneNumberId || !whatsappToken) {
        throw new Error("Both Phone Number ID and WhatsApp Token are required.");
    }

    await db.update(users)
        .set({
            phone_number_id: phoneNumberId,
            whatsapp_token: whatsappToken,
        })
        .where(eq(users.id, userId));

    revalidatePath("/dashboard/settings");

    return { success: true };
}
