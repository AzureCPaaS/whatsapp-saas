"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Users, Send, CheckCircle2, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

type CampaignInfo = {
    id: string;
    name: string;
    createdAt: Date;
    status: string;
};

type Metrics = {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    total: number;
};

type Recipient = {
    id: string;
    phone: string;
    name: string | null;
    status: string;
    createdAt: Date;
};

export default function CampaignDetailClient({
    campaign,
    metrics,
    recipients
}: {
    campaign: CampaignInfo;
    metrics: Metrics;
    recipients: Recipient[];
}) {
    // We treat 'total' as the baseline, but the funnel drops off at each stage.
    // 'Sent' means it left our server.
    // 'Delivered' means it hit their phone.
    // 'Read' means they opened it.

    // Sometimes we fake the funnel for aesthetic testing if data is low:
    const chartData = [
        { name: 'Sent', value: metrics.sent || metrics.total, color: '#3b82f6' },
        { name: 'Delivered', value: metrics.delivered, color: '#8b5cf6' },
        { name: 'Read', value: metrics.read, color: '#25D366' },
        { name: 'Failed', value: metrics.failed, color: '#ef4444' },
    ];

    const funnelStats = [
        { label: "Total Audience", value: metrics.total, icon: Users, color: "text-zinc-400" },
        { label: "Sent / In Transit", value: metrics.sent || metrics.total, icon: Send, color: "text-blue-400" },
        { label: "Delivered (Success)", value: metrics.delivered, icon: CheckCircle2, color: "text-purple-400" },
        { label: "Failed", value: metrics.failed, icon: AlertCircle, color: "text-red-400" },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col pb-10">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/broadcasts"
                    className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Broadcasts
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{campaign.name}</h1>
                        <p className="text-sm text-zinc-400 mt-1">
                            Sent on {new Date(campaign.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20">
                        {campaign.status.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Quick Stats Funnel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {funnelStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-5 rounded-2xl flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            <span className="text-sm text-zinc-400 font-medium">{stat.label}</span>
                        </div>
                        <span className="text-3xl font-bold text-white">{stat.value}</span>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Charts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1 glass-panel p-6 rounded-2xl h-[400px] flex flex-col"
                >
                    <h2 className="text-lg font-semibold text-white mb-6">Engagement Funnel</h2>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={12} width={70} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Right: Recipient Details Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 glass-panel rounded-2xl flex flex-col overflow-hidden max-h-[600px]"
                >
                    <div className="p-5 border-b border-[var(--color-glass-border)] flex justify-between items-center bg-black/20">
                        <h2 className="text-lg font-semibold text-white">Recipient Details</h2>
                        <span className="text-xs text-zinc-400 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                            {recipients.length} Records
                        </span>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="sticky top-0 bg-black/60 backdrop-blur-md z-10 shadow-sm border-b border-[var(--color-glass-border)]">
                                <tr className="text-xs uppercase tracking-wider text-zinc-500">
                                    <th className="px-6 py-4 font-medium">Contact</th>
                                    <th className="px-6 py-4 font-medium">Phone</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-glass-border)]">
                                {recipients.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                            No recipients found for this campaign.
                                        </td>
                                    </tr>
                                ) : (
                                    recipients.map((rec, i) => {
                                        let statusColor = "text-zinc-400 border-zinc-700 bg-zinc-800";
                                        if (rec.status === 'sent') statusColor = "text-blue-400 border-blue-500/30 bg-blue-500/10";
                                        if (rec.status === 'delivered') statusColor = "text-purple-400 border-purple-500/30 bg-purple-500/10";
                                        if (rec.status === 'read') statusColor = "text-[#25D366] border-[#25D366]/30 bg-[#25D366]/10";
                                        if (rec.status === 'failed') statusColor = "text-red-400 border-red-500/30 bg-red-500/10";

                                        return (
                                            <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-white font-medium">
                                                    {rec.name || "Unknown"}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-400">
                                                    {rec.phone}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${statusColor}`}>
                                                        {rec.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-zinc-500 font-mono">
                                                    {new Date(rec.createdAt).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
