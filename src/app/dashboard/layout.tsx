import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";
import { GlobalMessagePoller } from "@/components/layout/GlobalMessagePoller";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground relative transition-colors duration-300">
            {/* Background ambient glow matching glassmorphism */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#25D366]/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

            <Sidebar />
            <div className="flex-1 flex flex-col relative z-10 border-l border-[var(--color-glass-border)]">
                <Header />
                <main className="flex-1 p-4 md:p-8 w-full">
                    {children}
                </main>
            </div>
            <Toaster position="bottom-right" />
            <GlobalMessagePoller />
        </div>
    );
}
