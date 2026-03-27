"use client";

import { useState } from "react";
import { Bell, Search, User, LogOut, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/actions/auth";

export function Header() {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="h-16 glass-panel border-b border-[var(--color-glass-border)] bg-background/60 flex items-center justify-between px-8 z-10 sticky top-0 backdrop-blur-md">
            <div className="flex items-center bg-foreground/5 border border-foreground/10 rounded-full px-4 py-1.5 w-64 focus-within:ring-1 focus-within:ring-[#25D366]/50 transition-all">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-foreground placeholder-[var(--muted-foreground)] w-full"
                />
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Bell className="h-5 w-5" />
                    </button>
                    {showNotifications && (
                        <div className="absolute top-12 -right-4 w-72 bg-[#1A1A1D] border border-white/10 rounded-xl shadow-2xl p-4 z-50">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-glass-border)]">
                                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                                <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                            </div>
                            <div className="py-6 flex flex-col items-center justify-center text-center">
                                <div className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3">
                                    <Bell className="h-5 w-5 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm text-muted-foreground">No new notifications</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#25D366]/20 cursor-pointer">
                    TU
                </div>
                <form action={logout}>
                    <button type="submit" className="p-2 rounded-full hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400 group" title="Logout">
                        <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </button>
                </form>
            </div>
        </header>
    );
}
