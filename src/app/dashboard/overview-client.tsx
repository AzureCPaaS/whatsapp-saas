"use client";

import { motion } from "framer-motion";
import {
    MessageCircle,
    Users,
    CheckCircle2,
    TrendingUp,
    CreditCard,
    Phone
} from "lucide-react";

type Stat = {
    name: string;
    value: string;
    change: string;
    icon: "MessageCircle" | "Users" | "CheckCircle2" | "CreditCard";
    trend: string;
};

type Campaign = {
    name: string;
    status: string;
    audienceCount: string;
    createdAt: Date;
    templateName: string;
};

export default function DashboardOverviewClient({
    stats,
    campaigns
}: {
    stats: Stat[];
    campaigns: Campaign[];
}) {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                    <p className="text-zinc-400 mt-1">Welcome back, here is your WhatsApp business summary.</p>
                </div>

                {/* Connection Status Badge */}
                <div className="glass-panel px-4 py-2.5 rounded-full flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                        <Phone className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col pr-2">
                        <span className="text-sm font-medium text-white line-clamp-1">+1 (555) 123-4567</span>
                        <span className="text-xs text-[#25D366] font-medium flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                            Connected
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const IconComponent =
                        stat.icon === "MessageCircle" ? MessageCircle :
                            stat.icon === "Users" ? Users :
                                stat.icon === "CheckCircle2" ? CheckCircle2 :
                                    CreditCard;

                    return (
                        <motion.div
                            key={stat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-[#25D366]/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <IconComponent className="h-24 w-24 text-white" />
                            </div>

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-zinc-400 font-medium text-sm">{stat.name}</span>
                                <span className={`text-xs font-semibold flex items-center gap-1 ${stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                    {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : null}
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-white relative z-10">{stat.value}</div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Recent Activity */}
            <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Recent Campaigns</h2>
                <div className="space-y-4">
                    {campaigns.length === 0 ? (
                        <div className="text-zinc-500 text-sm text-center py-4">No recent campaigns. Create one to get started!</div>
                    ) : (
                        campaigns.map((campaign, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-white font-medium">{campaign.name}</span>
                                    <span className="text-xs text-zinc-400 mt-1">{new Date(campaign.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col text-right">
                                        <span className="text-xs text-zinc-400">Recipients</span>
                                        <span className="text-sm text-white font-medium">{campaign.audienceCount}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'completed' ? 'bg-[#25D366]/20 text-[#25D366]' :
                                        campaign.status === 'sending' ? 'bg-amber-500/20 text-amber-500' :
                                            'bg-indigo-500/20 text-indigo-400'
                                        }`}>
                                        {campaign.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
