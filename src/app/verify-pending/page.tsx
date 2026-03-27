import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyPendingPage() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden px-4">
            {/* Abstract Background for aesthetic consistency */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#25D366]/20 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl text-center">
                <div className="mx-auto w-16 h-16 bg-[#25D366]/20 rounded-full flex items-center justify-center mb-6">
                    <Mail className="h-8 w-8 text-[#25D366]" />
                </div>

                <h1 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                    Check your email
                </h1>

                <p className="text-zinc-400 mb-8 leading-relaxed">
                    We've sent a verification link to your email address.
                    Please click it to activate your Wazend account.
                </p>

                <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-medium text-white"
                >
                    Return to log in
                </Link>
            </div>
        </div>
    );
}
