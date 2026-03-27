"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    History,
    Settings,
    Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inbox", href: "/dashboard/inbox", icon: MessageSquare },
    { name: "Audience", href: "/dashboard/audience", icon: Users },
    { name: "Templates", href: "/dashboard/templates", icon: MessageSquare },
    { name: "Broadcasts", href: "/dashboard/broadcasts", icon: History },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 h-full glass-panel border-r-0 bg-background/60 text-foreground transition-colors duration-300">
            <div className="h-16 flex items-center px-6 border-b border-[var(--color-glass-border)] transition-colors">
                <Bot className="h-8 w-8 text-[#25D366] mr-3" />
                <span className="font-bold text-xl tracking-tight text-foreground">Wazend</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-[#25D366]/20 text-[#25D366] font-medium"
                                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-[#25D366]" : "")} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-[var(--color-glass-border)] transition-colors">
                <div className="bg-foreground/5 rounded-xl p-4 flex flex-col gap-2 transition-colors">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="text-sm font-semibold text-foreground">Starter - 1K Msgs</p>
                    <div className="w-full bg-foreground/10 rounded-full h-1.5 mt-1">
                        <div className="bg-[#25D366] h-1.5 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
