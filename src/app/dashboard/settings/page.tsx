import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/app/actions/dashboard";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
    const userId = await getCurrentUserId();

    // We only render this layout if authenticated, so userId should exist.
    // Dashboard layout handles redirecting if no user.
    let existingPhoneNumberId = "";
    let existingToken = "";

    if (userId) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });
        existingPhoneNumberId = user?.phone_number_id || "";
        existingToken = user?.whatsapp_token || "";
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-2">
                    <SettingsForm
                        initialPhoneNumberId={existingPhoneNumberId}
                        initialToken={existingToken}
                    />
                </div>
            </div>
        </div>
    );
}
