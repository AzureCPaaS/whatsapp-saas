"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Zap, Shield, Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-[#25D366]/30">
      {/* Abstract Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#25D366]/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-[#25D366]" />
          <span className="font-bold text-2xl tracking-tight">Wazend</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
          </span>
          Official WhatsApp Business API Partner
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]"
        >
          Engage customers on <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] to-indigo-400">
            WhatsApp
          </span> instantly.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12"
        >
          The complete CRM and broadcast platform for local businesses to send bills,
          catalogs, and promotional messages directly to customers' pockets.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-full bg-[#25D366] text-black font-semibold text-lg hover:bg-[#128C7E] hover:text-white transition-all flex items-center gap-2"
          >
            Go to Dashboard <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 rounded-full glass-panel text-white font-semibold text-lg hover:bg-white/10 transition-all"
          >
            View Features
          </Link>
        </motion.div>

        {/* Feature Grid Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          {[
            {
              icon: MessageSquare,
              title: "Unlimited Broadcasts",
              desc: "Reach thousands of customers with targeted promotions and updates."
            },
            {
              icon: Zap,
              title: "Automated Responders",
              desc: "Set up keywords to automatically reply with catalogs or opening hours."
            },
            {
              icon: Shield,
              title: "Verified Green Tick",
              desc: "Get the official WhatsApp Business verified badge for your brand."
            }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="h-12 w-12 rounded-2xl bg-[#25D366]/20 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-[#25D366]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
