"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ScrollArea({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const mainRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!mainRef.current) return;

        // Wait for React to finish rendering the new route components
        requestAnimationFrame(() => {
            if (mainRef.current) {
                mainRef.current.scrollTop = 0;
            }
        });
    }, [pathname, searchParams]);

    return (
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-8 relative w-full">
            {children}
        </main>
    );
}
