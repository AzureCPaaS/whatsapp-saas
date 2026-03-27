import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { messages, users, contacts } from "@/db/schema";
import { eq } from "drizzle-orm";

const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "whatsapp_saas_secret";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
        console.log("✅ Webhook verified by Meta!");
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Log the full payload for debugging the Graph API
        console.log("📦 Incoming Webhook Payload:", JSON.stringify(body, null, 2));

        if (body.object !== "whatsapp_business_account") {
            return new NextResponse("Not Found", { status: 404 });
        }

        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value) return new NextResponse("OK", { status: 200 });

        // 1. Handle Message Delivery Statuses (Outbound Receipts)
        if (value.statuses && value.statuses.length > 0) {
            const statusObj = value.statuses[0];
            const metaMessageId = statusObj.id;
            const deliveryStatus = statusObj.status; // 'sent', 'delivered', 'read', 'failed'

            // Update the message status in the database
            await db.update(messages)
                .set({ status: deliveryStatus })
                .where(eq(messages.metaMessageId, metaMessageId));

            console.log(`🔄 Message Delivery Update: ${metaMessageId} -> ${deliveryStatus}`);
        }

        // 2. Handle Incoming Customer Messages (Inbound)
        if (value.messages && value.messages.length > 0) {
            const msgObj = value.messages[0];
            const contactPhone = msgObj.from;
            const msgType = msgObj.type;
            const metaMessageId = msgObj.id;

            let content = "";
            if (msgType === "text") {
                content = msgObj.text.body;
            }

            // To map this to a workspace, we'll find the first user for this prototype
            const defaultUser = await db.query.users.findFirst();
            const workspaceId = defaultUser?.id;

            if (workspaceId) {
                // Insert the inbound message into the database
                await db.insert(messages).values({
                    workspaceId,
                    contactPhone,
                    direction: "inbound",
                    type: msgType,
                    content,
                    status: "delivered", // Inbound messages are implicitly delivered
                    metaMessageId
                });

                // Soft check: if this contact doesn't exist, we could automatically create them
                const existingContact = await db.query.contacts.findFirst({
                    where: eq(contacts.phone, contactPhone)
                });

                if (!existingContact) {
                    await db.insert(contacts).values({
                        workspaceId,
                        name: value.contacts?.[0]?.profile?.name || "Unknown Sender",
                        phone: contactPhone,
                        tags: ["Inbound Lead"],
                        status: "subscribed"
                    });
                }
            }

            console.log(`📩 Received Inbound Message from ${contactPhone}: ${content}`);
            revalidatePath("/dashboard/inbox");
        }

        return new NextResponse("OK", { status: 200 });

    } catch (error) {
        console.error("Webhook POST Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
