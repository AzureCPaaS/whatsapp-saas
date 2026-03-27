"use client";

import { useActionState, Suspense } from "react";
import { login } from "@/app/actions/auth";
import { Bot, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

const initialState = {
    error: "",
};

function LoginContent() {
    const searchParams = useSearchParams();
    const [state, formAction, isPending] = useActionState(login, initialState);

    // Read URL params
    const isVerified = searchParams.get("verified") === "true";
    const urlError = searchParams.get("error");

    let displayError = state?.error;
    if (!displayError) {
        if (urlError === "VerificationFailed") displayError = "Invalid or expired verification token. Please sign up again.";
        else if (urlError === "ServerError") displayError = "An unexpected error occurred during verification. Please try again later.";
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md relative z-10"
        >
            <div className="flex flex-col items-center mb-8">
                <Link href="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                    <Bot className="h-10 w-10 text-[#25D366]" />
                    <span className="font-bold text-3xl tracking-tight">Wazend</span>
                </Link>
                <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                    Welcome back
                </h1>
                <p className="text-zinc-500 mt-2">Sign in to your dashboard</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {isVerified && (
                    <div className="mb-4 text-sm bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] px-4 py-3 rounded-lg flex items-center justify-center text-center">
                        Email successfully verified! You can now sign in.
                    </div>
                )}

                <form action={formAction} className="flex flex-col gap-5 relative z-10">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="test@azurecpaas.com"
                            required
                            disabled={isPending}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:border-[#25D366]/50 transition-all disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-2 mt-2">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            disabled={isPending}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:border-[#25D366]/50 transition-all disabled:opacity-50"
                        />
                    </div>

                    {displayError && (
                        <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">
                            {displayError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#25D366] text-black font-semibold rounded-xl px-4 py-3 mt-2 flex items-center justify-center gap-2 hover:bg-[#128C7E] hover:text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-zinc-500">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-[#25D366] hover:text-white transition-colors font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden selection:bg-[#25D366]/30 px-4">
            {/* Background ambient glow matching glassmorphism */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#25D366]/20 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none" />

            <Suspense fallback={<div className="text-zinc-400">Loading form...</div>}>
                <LoginContent />
            </Suspense>
        </div>
    );
}
