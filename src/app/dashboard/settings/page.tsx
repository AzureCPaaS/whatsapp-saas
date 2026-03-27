import { Settings2, User, Bell, Shield, Key } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Settings2 className="h-8 w-8 text-[#25D366]" />
                    Settings
                </h1>
                <p className="text-zinc-400 mt-2">Manage your workspace preferences, personal profile, and API integrations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-[#25D366]/50 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/10 transition-colors">
                        <User className="h-5 w-5 text-zinc-400 group-hover:text-[#25D366] transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Profile Details</h3>
                    <p className="text-sm text-zinc-500">Update your name, email, and timezone settings.</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-[#25D366]/50 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/10 transition-colors">
                        <Bell className="h-5 w-5 text-zinc-400 group-hover:text-[#25D366] transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Notifications</h3>
                    <p className="text-sm text-zinc-500">Manage email digests and WhatsApp routing alerts.</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-[#25D366]/50 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/10 transition-colors">
                        <Shield className="h-5 w-5 text-zinc-400 group-hover:text-[#25D366] transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Security</h3>
                    <p className="text-sm text-zinc-500">Update password and configure Two-Factor Authentication.</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-[#25D366]/50 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/10 transition-colors">
                        <Key className="h-5 w-5 text-zinc-400 group-hover:text-[#25D366] transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">API Integrations</h3>
                    <p className="text-sm text-zinc-500">Manage your Meta Webhook tokens and external connections.</p>
                </div>
            </div>

            <div className="mt-8 glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Coming Soon</h3>
                    <p className="text-sm text-zinc-500">These settings are currently view-only. Full configuration options will roll out in the next update.</p>
                </div>
            </div>
        </div>
    );
}
