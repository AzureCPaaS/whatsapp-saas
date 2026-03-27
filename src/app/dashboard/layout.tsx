import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden relative transition-colors duration-300">
            {/* Background ambient glow matching glassmorphism */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#25D366]/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

            <Sidebar />
            <div className="flex-1 flex flex-col h-full relative z-10 border-l border-[var(--color-glass-border)]">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
            <Toaster position="bottom-right" />
        </div>
    );
}
