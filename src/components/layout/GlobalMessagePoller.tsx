"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/app/actions/inbox";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function GlobalMessagePoller() {
    const [lastChecked, setLastChecked] = useState<number>(() => Date.now());
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        
        const interval = setInterval(async () => {
            try {
                const recentConversations = await getConversations();
                if (!isMounted) return;

                const newMessages = recentConversations.filter(c => 
                    c.direction === "inbound" && 
                    new Date(c.createdAt).getTime() > lastChecked
                );

                if (newMessages.length > 0) {
                    const maxTime = Math.max(...newMessages.map(m => new Date(m.createdAt).getTime()));
                    setLastChecked(maxTime);

                    newMessages.forEach(msg => {
                        toast((t) => (
                          <div 
                            className="cursor-pointer flex flex-col gap-1 pr-4"
                            onClick={() => {
                                toast.dismiss(t.id);
                                router.push(`/dashboard/inbox?contact=${encodeURIComponent(msg.contactPhone)}`);
                            }}
                          >
                            <span className="font-semibold text-sm text-zinc-900">New WhatsApp Message</span>
                            <span className="text-xs text-zinc-600">{msg.contactPhone}</span>
                            <span className="text-xs text-blue-600 mt-1">Tap to open chat</span>
                          </div>
                        ), { 
                            duration: 5000, 
                            position: "top-right"
                        });
                    });
                }
            } catch (err) {
                // Ignore silent auth errors
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [lastChecked, router]);

    return null;
}
