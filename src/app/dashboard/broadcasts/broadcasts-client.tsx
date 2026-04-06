"use client";

import { useState, useEffect } from "react";
import { Send, Users, MessageSquare, ArrowRight, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createAndSendBroadcast, createAndSendCustomText } from "@/app/actions/campaigns";
import { getWhatsAppTemplates } from "@/app/actions/templates";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Campaign = {
    id: string;
    name: string;
    templateName: string;
    audienceCount: string;
    status: string;
    createdAt: Date;
};

export default function BroadcastsClient({ campaigns, audienceCount, segments }: { campaigns: Campaign[], audienceCount: number, segments: { name: string, count: number }[] }) {
    const [step, setStep] = useState(1);
    const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
    const [campaignName, setCampaignName] = useState("Holiday Sale Blast");
    const [isSending, setIsSending] = useState(false);

    // Message Type State
    const [messageType, setMessageType] = useState<"TEMPLATE" | "CUSTOM">("TEMPLATE");
    const [customMessageText, setCustomMessageText] = useState("");

    // Template State
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const fetchedTemplates = await getWhatsAppTemplates("APPROVED");
                setTemplates(fetchedTemplates);
                if (fetchedTemplates.length > 0) {
                    setSelectedTemplate(fetchedTemplates[0]);
                }
            } catch (e) {
                console.error("Failed to load templates", e);
            } finally {
                setIsLoadingTemplates(false);
            }
        };
        loadTemplates();
    }, []);

    async function handleSendCampaign() {
        if (!campaignName) return alert("Please enter a campaign name");

        if (messageType === "TEMPLATE" && !selectedTemplate) {
            return alert("Please select a template");
        }

        if (messageType === "CUSTOM" && !customMessageText.trim()) {
            return alert("Please enter your custom message");
        }

        setIsSending(true);
        try {
            const formData = new FormData();
            formData.append("name", campaignName);

            if (selectedSegment) {
                formData.append("segmentTarget", selectedSegment);
            }

            let result;
            if (messageType === "TEMPLATE") {
                formData.append("templateName", selectedTemplate.name);
                formData.append("templateLanguage", selectedTemplate.language);
                result = await createAndSendBroadcast(formData);
            } else {
                formData.append("messageText", customMessageText);
                result = await createAndSendCustomText(formData);
            }

            if (result?.error) {
                alert("Error: " + result.error);
                return;
            }

            if (result?.success) {
                alert(`Campaign launched successfully! Sent: ${result.metrics.successCount}, Failed: ${result.metrics.failCount}`);
                setStep(1); // reset wizard
                setCustomMessageText("");
                router.refresh(); // refresh table
            }
        } catch (e: any) {
            console.error(e);
            alert("Error: " + e.message);
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            {/* Creation Wizard */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create Broadcast</h1>
                    <p className="text-zinc-400 mt-1">Send a template message to a selected audience segment.</p>
                </div>

                <div className="flex items-center justify-between mb-8 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/5 z-0"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#25D366] z-0 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

                    {[
                        { num: 1, label: "Audience", icon: Users },
                        { num: 2, label: "Template", icon: MessageSquare },
                        { num: 3, label: "Review", icon: Send }
                    ].map((s) => (
                        <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`h-10 w-10 pl-0.5 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s.num ? 'bg-[#25D366] text-black shadow-lg shadow-[#25D366]/30' : 'bg-zinc-900 border border-white/10 text-zinc-500'
                                }`}>
                                {step > s.num ? <CheckCircle2 className="h-5 w-5 mr-0.5" /> : s.num}
                            </div>
                            <span className={`text-xs font-medium ${step >= s.num ? 'text-white' : 'text-zinc-500'}`}>{s.label}</span>
                        </div>
                    ))}
                </div>

                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel p-8 rounded-2xl"
                >
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white">Select Audience Segment</h2>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {[{ name: "All Contacts", count: audienceCount, value: null }, ...segments.map(s => ({ ...s, value: s.name }))].map((segment, i) => (
                                    <label key={i} onClick={() => setSelectedSegment(segment.value)} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${selectedSegment === segment.value ? 'border-[#25D366]/50 bg-[#25D366]/5' : 'border-white/10 hover:border-white/20 bg-black/40'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${selectedSegment === segment.value ? 'border-[#25D366] bg-[#25D366]' : 'border-zinc-600'
                                                }`}>
                                                {selectedSegment === segment.value && <div className="h-2 w-2 rounded-full bg-black"></div>}
                                            </div>
                                            <span className="font-medium text-white">{segment.name} ({segment.count})</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2"
                                >
                                    Continue <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white">Choose a Message Type</h2>

                            {/* Message Type Toggle */}
                            <div className="flex p-1 bg-black/40 rounded-xl border border-white/10 w-full mb-6">
                                <button
                                    onClick={() => setMessageType("TEMPLATE")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${messageType === "TEMPLATE" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    Pre-Approved Template
                                </button>
                                <button
                                    onClick={() => setMessageType("CUSTOM")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${messageType === "CUSTOM" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    Custom Text (24h Window)
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Campaign Name</label>
                                    <input
                                        type="text"
                                        value={campaignName}
                                        onChange={(e) => setCampaignName(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-[#25D366]"
                                    />
                                </div>

                                {messageType === "TEMPLATE" ? (
                                    <div className="relative">
                                        <label className="block text-sm text-zinc-400 mb-2">WhatsApp Template</label>
                                        <button
                                            onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/40 text-left hover:border-white/20 transition-colors"
                                        >
                                            <div className="flex flex-col">
                                                {isLoadingTemplates ? (
                                                    <span className="font-medium text-white">Loading templates...</span>
                                                ) : selectedTemplate ? (
                                                    <>
                                                        <span className="font-medium text-white">{selectedTemplate.name}</span>
                                                        <span className="text-sm text-zinc-400">{selectedTemplate.category.replace('_', ' ')} • {selectedTemplate.language}</span>
                                                    </>
                                                ) : (
                                                    <span className="font-medium text-zinc-400">No approved templates found</span>
                                                )}
                                            </div>
                                            <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform ${isTemplateMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        <AnimatePresence>
                                            {isTemplateMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-50 w-full mt-2 bg-[#1A1A1D] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                                                >
                                                    {templates.map(tmpl => (
                                                        <button
                                                            key={tmpl.id}
                                                            onClick={() => {
                                                                setSelectedTemplate(tmpl);
                                                                setIsTemplateMenuOpen(false);
                                                            }}
                                                            className={`w-full text-left p-4 hover:bg-white/5 transition-colors flex flex-col ${selectedTemplate?.id === tmpl.id ? 'bg-[#25D366]/10 border-l-2 border-[#25D366]' : ''}`}
                                                        >
                                                            <span className="font-medium text-white">{tmpl.name}</span>
                                                            <span className="text-xs text-zinc-400">{tmpl.category} • {tmpl.language}</span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Custom Message <span className="text-rose-500">*</span></label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={customMessageText}
                                            onChange={(e) => setCustomMessageText(e.target.value)}
                                            placeholder="Write your custom text message here..."
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-[#25D366] resize-none"
                                        />
                                        <p className="text-xs text-amber-500 mt-2">
                                            Note: Custom text messages will only be delivered to contacts who have messaged your business number within the last 24 hours.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 rounded-xl border border-white/10 bg-zinc-900/50 max-w-sm mx-auto relative mt-8">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-800 px-3 py-1 rounded-full text-xs font-medium text-zinc-400 border border-white/5">
                                    Preview
                                </div>
                                <div className="bg-[#202C33] p-3 rounded-tr-lg rounded-b-lg text-sm text-[#E9EDEF] shadow-md ml-4 mt-2">
                                    <div className="whitespace-pre-wrap">
                                        {messageType === "TEMPLATE"
                                            ? (selectedTemplate?.components?.find((c: any) => c.type === 'BODY')?.text || `(Preview text for ${selectedTemplate?.name} is not loaded)`)
                                            : (customMessageText || "Type a message to see a preview...")
                                        }
                                    </div>
                                    <div className="text-right text-[10px] text-zinc-400 mt-2">10:42 AM</div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-zinc-400 hover:text-white px-6 py-2.5 rounded-full font-medium transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2"
                                >
                                    Continue <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 text-center">
                            <div className="h-20 w-20 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-6">
                                <Send className="h-8 w-8 text-[#25D366] ml-[-2px]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Ready to send?</h2>
                            <p className="text-zinc-400 max-w-sm mx-auto">
                                You are about to send <span className="text-white font-medium">{campaignName}</span> using {messageType === "TEMPLATE" ?
                                    <span>template <span className="text-white font-medium">{selectedTemplate?.name || 'Unknown'}</span></span> :
                                    <span className="text-white font-medium">Custom Text</span>
                                } to <span className="text-white font-medium">{selectedSegment ? `Segment: ${selectedSegment} (${segments.find(s => s.name === selectedSegment)?.count || 0})` : `All Contacts (${audienceCount})`}</span>.
                            </p>

                            <div className="flex justify-center gap-4 pt-8">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={isSending}
                                    className="text-zinc-400 hover:text-white px-6 py-3 rounded-full font-medium transition-colors"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleSendCampaign}
                                    disabled={isSending}
                                    className="bg-[#25D366] text-black hover:bg-[#128C7E] hover:text-white px-8 py-3 rounded-full font-bold text-lg transition-colors shadow-lg shadow-[#25D366]/20 disabled:opacity-50"
                                >
                                    {isSending ? "Sending..." : "Launch Campaign"}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Past Campaigns Table */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Broadcast History</h2>
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-[var(--color-glass-border)] text-xs uppercase tracking-wider text-zinc-500 bg-black/20">
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Template</th>
                                <th className="px-6 py-4 font-medium">Recipients</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-glass-border)]">
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No broadcast history found. Create one above!
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign, i) => (
                                    <tr
                                        key={campaign.id || i}
                                        className="hover:bg-white/[0.05] transition-colors cursor-pointer group relative"
                                        onClick={() => router.push(`/dashboard/broadcasts/${campaign.id}`)}
                                    >
                                        <td className="px-6 py-4 font-medium text-white group-hover:text-[#25D366] transition-colors">{campaign.name}</td>
                                        <td className="px-6 py-4 text-zinc-400 text-sm">{campaign.templateName}</td>
                                        <td className="px-6 py-4 text-white text-sm">{campaign.audienceCount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${campaign.status === 'completed' ? 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20' :
                                                campaign.status === 'sending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                    'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                                }`}>
                                                {campaign.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-400 flex items-center justify-between">
                                            {new Date(campaign.createdAt).toLocaleDateString()}
                                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#25D366]" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
