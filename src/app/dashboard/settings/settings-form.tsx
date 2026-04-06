"use client";

import { useTransition } from "react";
import { updateWhatsAppCredentials } from "@/app/actions/settings";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function SettingsForm({ initialPhoneNumberId, initialToken }: { initialPhoneNumberId: string, initialToken: string }) {
    const [isPending, startTransition] = useTransition();

    async function clientAction(formData: FormData) {
        startTransition(async () => {
            try {
                const result = await updateWhatsAppCredentials(formData);
                if (result.success) {
                    toast.success("Settings saved successfully.");
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to save settings.");
            }
        });
    }

    return (
        <div className="bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] rounded-xl shadow-lg p-6 backdrop-blur-md">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">WhatsApp API Configuration</h3>
                <p className="text-sm text-neutral-400 mt-1">
                    Connect your Meta WhatsApp Business Cloud API account to enable messaging. These credentials are required to send campaigns and reply to inbound messages.
                </p>
            </div>
            <form action={clientAction} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="phoneNumberId" className="block text-sm font-medium text-foreground">Phone Number ID</label>
                    <input
                        id="phoneNumberId"
                        name="phoneNumberId"
                        placeholder="e.g. 11029348910243"
                        defaultValue={initialPhoneNumberId}
                        required
                        className="flex h-10 w-full rounded-md border border-[var(--color-glass-border)] bg-background/50 px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus:border-[#25D366] transition-colors"
                    />
                    <p className="text-xs text-neutral-500">Found in your Meta App Dashboard under WhatsApp &rarr; Getting Started.</p>
                </div>
                <div className="space-y-2">
                    <label htmlFor="whatsappToken" className="block text-sm font-medium text-foreground">System User Access Token</label>
                    <input
                        id="whatsappToken"
                        name="whatsappToken"
                        type="password"
                        placeholder="EAA..."
                        defaultValue={initialToken}
                        required
                        className="flex h-10 w-full rounded-md border border-[var(--color-glass-border)] bg-background/50 px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus:border-[#25D366] transition-colors"
                    />
                    <p className="text-xs text-neutral-500">Ensure you use a permanent System User Token, not a temporary 24-hour test token.</p>
                </div>

                <div className="pt-4 flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-[#25D366] text-white hover:bg-[#1DA851] h-10 px-4 py-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
