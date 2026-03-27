"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { Bot, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const initialState = {
    error: "",
};

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signup, initialState);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden selection:bg-[#25D366]/30 px-4">
            {/* Background ambient glow matching glassmorphism */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#25D366]/20 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none" />

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
                        Create an account
                    </h1>
                    <p className="text-zinc-500 mt-2">Get started with your free trial</p>
                </div>

                <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <form action={formAction} className="flex flex-col gap-4 relative z-10">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Jane Doe"
                                required
                                disabled={isPending}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:border-[#25D366]/50 transition-all disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2 mt-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="jane@company.com"
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
                                minLength={8}
                                disabled={isPending}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:border-[#25D366]/50 transition-all disabled:opacity-50"
                            />
                            <p className="text-xs text-zinc-500 mt-2">Must be at least 8 characters long.</p>
                        </div>

                        {state?.error && (
                            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg mt-2">
                                {state.error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#25D366] text-black font-semibold rounded-xl px-4 py-3 mt-4 flex items-center justify-center gap-2 hover:bg-[#128C7E] hover:text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-zinc-500">
                                Already have an account?{" "}
                                <Link href="/login" className="text-[#25D366] hover:text-white transition-colors font-medium">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
