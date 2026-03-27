"use client";

import { useState } from "react";
import { Plus, Search, Image as ImageIcon, FileText, CheckCircle2, Clock, Ban, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createWhatsAppTemplate, deleteWhatsAppTemplate } from "@/app/actions/templates";

export default function TemplatesClient({ initialTemplates }: { initialTemplates: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [templates, setTemplates] = useState(initialTemplates);

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Template Form State
    const [newTemplate, setNewTemplate] = useState({
        name: "",
        category: "MARKETING",
        language: "en_US",
        headerText: "",
        bodyText: "",
        footerText: ""
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle2 className="h-4 w-4 text-[#25D366]" />;
            case 'PENDING': return <Clock className="h-4 w-4 text-amber-500" />;
            case 'REJECTED': return <Ban className="h-4 w-4 text-rose-500" />;
            default: return null;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'APPROVED': return "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20";
            case 'PENDING': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'REJECTED': return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default: return "bg-zinc-800 text-zinc-400 border border-zinc-700";
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (templateName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete the template "${templateName}"? This cannot be undone.`)) return;

        try {
            await deleteWhatsAppTemplate(templateName);
            setTemplates(templates.filter(t => t.name !== templateName));
            alert("Template deleted successfully.");
        } catch (error: any) {
            alert(error.message || "Failed to delete template");
        }
    };

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();

        // WhatsApp template name validation (lowercase and underscores only)
        if (!/^[a-z0-9_]+$/.test(newTemplate.name)) {
            return alert("Template name can only contain lowercase letters, numbers, and underscores.");
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", newTemplate.name);
            formData.append("category", newTemplate.category);
            formData.append("language", newTemplate.language);
            formData.append("bodyText", newTemplate.bodyText);
            if (newTemplate.headerText) formData.append("headerText", newTemplate.headerText);
            if (newTemplate.footerText) formData.append("footerText", newTemplate.footerText);

            await createWhatsAppTemplate(formData);

            alert("Template submitted for review successfully!");
            setIsCreateModalOpen(false);

            // Re-fetch or manually add to list (optimistic)
            // Since Server action already revalidates path, a page refresh via router.refresh() 
            // or just letting Next.js handle it might be better, 
            // but for instant feedback we can append a pending local object:
            const optimisticTemplate = {
                id: `temp_${Date.now()}`,
                name: newTemplate.name,
                category: newTemplate.category,
                language: newTemplate.language,
                status: "PENDING",
                components: [
                    { type: "BODY", text: newTemplate.bodyText }
                ]
            };
            setTemplates([optimisticTemplate, ...templates]);

            // Reset form
            setNewTemplate({
                name: "",
                category: "MARKETING",
                language: "en_US",
                headerText: "",
                bodyText: "",
                footerText: ""
            });

        } catch (error: any) {
            alert(error.message || "Failed to create template");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Message Templates</h1>
                    <p className="text-zinc-400 mt-1">Manage your pre-approved WhatsApp templates for broadcasts.</p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#25D366] hover:bg-[#128C7E] px-4 py-2 rounded-full text-sm font-medium text-black transition-colors flex items-center gap-2 shadow-lg shadow-[#25D366]/20"
                >
                    <Plus className="h-4 w-4" /> Create Template
                </button>
            </div>

            <div className="flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-2.5 w-full max-w-md focus-within:ring-1 focus-within:ring-[#25D366]/50 transition-all">
                <Search className="h-4 w-4 text-zinc-500 mr-2" />
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 w-full"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template, i) => {
                    // Try to find the body text for preview
                    const bodyComponent = template.components?.find((c: any) => c.type === 'BODY');

                    return (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-panel rounded-2xl overflow-hidden flex flex-col group transition-transform duration-300 relative"
                        >
                            {/* Delete Button (Visible on Hover) */}
                            <button
                                onClick={(e) => handleDelete(template.name, e)}
                                className="absolute top-3 right-3 z-20 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400"
                                title="Delete Template"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>

                            {/* Template Header / Mockup Preview */}
                            <div className="h-32 bg-white/5 border-b border-[var(--color-glass-border)] p-4 relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/5 to-transparent z-0"></div>
                                <div className="flex flex-col items-center gap-2 text-zinc-500 z-10 w-full px-6">
                                    <FileText className="h-6 w-6 mb-1" />
                                    {bodyComponent ? (
                                        <p className="text-xs text-center line-clamp-2 italic text-zinc-400">"{bodyComponent.text}"</p>
                                    ) : (
                                        <span className="text-xs font-medium">Text Template</span>
                                    )}
                                </div>
                            </div>

                            {/* Template Details */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-white tracking-tight break-all pr-8">{template.name}</h3>
                                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(template.status)} absolute right-5 bottom-5`}>
                                        {getStatusIcon(template.status)}
                                        {template.status}
                                    </span>
                                </div>

                                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-white/5 pr-24">
                                    <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-zinc-400 font-medium border border-white/5">
                                        {template.category.replace('_', ' ')}
                                    </span>
                                    <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-zinc-400 font-medium border border-white/5 uppercase">
                                        {template.language}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Create New Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: filteredTemplates.length * 0.05 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-zinc-500 hover:text-white hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition-all cursor-pointer min-h-[250px]"
                >
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-sm">Create new template</span>
                </motion.div>
            </div>

            {/* Create Template Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Create Message Template</h2>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5 text-zinc-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTemplate} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm text-zinc-400 mb-1">Template Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTemplate.name}
                                            onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                                            placeholder="e.g., holiday_sale_promo"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-[#25D366] font-mono text-sm"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1">Lowercase letters, numbers, and underscores only.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Category</label>
                                        <select
                                            value={newTemplate.category}
                                            onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-[#25D366]"
                                        >
                                            <option value="MARKETING">Marketing</option>
                                            <option value="UTILITY">Utility</option>
                                            <option value="AUTHENTICATION">Authentication</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Language</label>
                                        <select
                                            value={newTemplate.language}
                                            onChange={e => setNewTemplate({ ...newTemplate, language: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-[#25D366]"
                                        >
                                            <option value="en_US">English (US)</option>
                                            <option value="en_GB">English (UK)</option>
                                            <option value="es_MX">Spanish (Mexico)</option>
                                            <option value="es_ES">Spanish (Spain)</option>
                                            <option value="pt_BR">Portuguese (Brazil)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-white/5 pt-5 mt-5">
                                    <h3 className="text-sm font-medium text-white mb-4">Template Content</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">Header (Optional)</label>
                                            <input
                                                type="text"
                                                maxLength={60}
                                                value={newTemplate.headerText}
                                                onChange={e => setNewTemplate({ ...newTemplate, headerText: e.target.value })}
                                                placeholder="e.g., Summer Sale is Here!"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-[#25D366]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">Body Text <span className="text-rose-500">*</span></label>
                                            <textarea
                                                required
                                                rows={4}
                                                maxLength={1024}
                                                value={newTemplate.bodyText}
                                                onChange={e => setNewTemplate({ ...newTemplate, bodyText: e.target.value })}
                                                placeholder="Use {{1}}, {{2}} for variables if needed. e.g., Hello {{1}}, your order {{2}} is ready."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-[#25D366] resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-1">Footer (Optional)</label>
                                            <input
                                                type="text"
                                                maxLength={60}
                                                value={newTemplate.footerText}
                                                onChange={e => setNewTemplate({ ...newTemplate, footerText: e.target.value })}
                                                placeholder="e.g., Reply STOP to unsubscribe."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-[#25D366]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Live Preview Box */}
                                <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 mt-4">
                                    <div className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Live Preview</div>
                                    <div className="bg-[#202C33] p-3 rounded-tr-lg rounded-b-lg text-sm text-[#E9EDEF] shadow-md max-w-[80%]">
                                        {newTemplate.headerText && <div className="font-bold mb-1 text-white">{newTemplate.headerText}</div>}
                                        <div className="whitespace-pre-wrap">{newTemplate.bodyText || "Your message body will appear here..."}</div>
                                        {newTemplate.footerText && <div className="text-xs text-zinc-400 mt-1">{newTemplate.footerText}</div>}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-6 py-2.5 rounded-full font-medium text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-[#25D366] text-black hover:bg-[#128C7E] px-6 py-2.5 rounded-full font-bold transition-colors shadow-lg shadow-[#25D366]/20 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit for Review"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
