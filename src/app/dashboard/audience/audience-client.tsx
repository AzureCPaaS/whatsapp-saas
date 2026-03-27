"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Download, Filter, Trash2, Edit2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addContact } from "@/app/actions/dashboard";
import { deleteContact, updateContact } from "@/app/actions/audience";
import { useRouter } from "next/navigation";
import CsvUploader from "./csv-uploader";

type Contact = {
    id: string;
    name: string | null;
    phone: string;
    tags: string[] | null;
    status: string;
    createdAt: Date;
};

export default function AudienceClient({ contacts }: { contacts: Contact[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [isImportingMode, setIsImportingMode] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const router = useRouter();

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const filteredContacts = contacts.filter(c =>
        (c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        c.phone.includes(searchQuery)
    );

    async function handleAddContact(formData: FormData) {
        setIsPending(true);
        try {
            await addContact(formData);
            setIsAddingMode(false);
            router.refresh(); // Refresh the page to get the new list from Server Action
        } catch (e) {
            console.error(e);
            alert("Failed to add contact");
        } finally {
            setIsPending(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this contact?")) return;

        setDeletingId(id);
        try {
            const res = await deleteContact(id);
            if (res.success) {
                router.refresh();
            } else {
                alert("Failed to delete contact: " + res.error);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to delete contact");
        } finally {
            setDeletingId(null);
        }
    }

    async function handleEditContact(formData: FormData) {
        if (!editingContact) return;
        setIsPending(true);
        try {
            const res = await updateContact(editingContact.id, formData);
            if (res.success) {
                setEditingContact(null);
                router.refresh();
            } else {
                alert("Failed to update contact: " + res.error);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to update contact");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Audience</h1>
                    <p className="text-zinc-400 mt-1">Manage your contacts, segments, and opt-in status.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="glass-panel px-4 py-2 rounded-full text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2 text-white">
                        <Download className="h-4 w-4" /> Export
                    </button>
                    {!isAddingMode && !isImportingMode && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsImportingMode(true)}
                                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium text-white transition-colors flex items-center gap-2"
                            >
                                Import CSV
                            </button>
                            <button
                                onClick={() => setIsAddingMode(true)}
                                className="bg-[#25D366] hover:bg-[#128C7E] px-4 py-2 rounded-full text-sm font-medium text-black transition-colors flex items-center gap-2 shadow-lg shadow-[#25D366]/20"
                            >
                                <Plus className="h-4 w-4" /> Add Contact
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isImportingMode && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 flex justify-center"
                >
                    <div className="relative w-full max-w-2xl">
                        <button
                            onClick={() => setIsImportingMode(false)}
                            className="absolute -top-3 -right-3 bg-zinc-800 text-white p-1 rounded-full hover:bg-zinc-700 transition z-10"
                        >
                            <Plus className="h-4 w-4 rotate-45" />
                        </button>
                        <CsvUploader onComplete={() => {
                            setIsImportingMode(false);
                            router.refresh();
                        }} />
                    </div>
                </motion.div>
            )}

            {isAddingMode && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 rounded-2xl border border-[#25D366]/30 mb-4"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Add New Contact</h2>
                    <form action={handleAddContact} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm text-zinc-400 mb-1">Name</label>
                            <input
                                name="name"
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-[#25D366]"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm text-zinc-400 mb-1">WhatsApp Number</label>
                            <input
                                name="phone"
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-[#25D366]"
                                placeholder="+1234567890"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAddingMode(false)}
                                className="px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-6 py-2.5 rounded-xl bg-[#25D366] text-black font-semibold hover:bg-[#128C7E] transition-colors disabled:opacity-50"
                            >
                                {isPending ? "Adding..." : "Save"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {editingContact && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 rounded-2xl border border-blue-500/30 mb-4 relative"
                >
                    <button
                        onClick={() => setEditingContact(null)}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-white mb-4">Edit Contact</h2>
                    <form action={handleEditContact} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm text-zinc-400 mb-1">Name</label>
                            <input
                                name="name"
                                required
                                defaultValue={editingContact.name || ""}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm text-zinc-400 mb-1">WhatsApp Number</label>
                            <input
                                name="phone"
                                required
                                defaultValue={editingContact.phone}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-6 py-2.5 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {isPending ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="glass-panel rounded-2xl flex-1 overflow-visible flex flex-col min-h-[500px]">
                {/* Toolbar */}
                <div className="p-4 border-b border-[var(--color-glass-border)] flex items-center justify-between gap-4">
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-2 w-full max-w-sm focus-within:ring-1 focus-within:ring-[#25D366]/50 transition-all">
                        <Search className="h-4 w-4 text-zinc-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 w-full"
                        />
                    </div>
                    <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-zinc-400">
                        <Filter className="h-5 w-5" />
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-visible pb-32">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-[var(--color-glass-border)] text-xs uppercase tracking-wider text-zinc-500 bg-black/20">
                                <th className="px-6 py-4 font-medium">Name & Phone</th>
                                <th className="px-6 py-4 font-medium">Tags</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date Added</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-glass-border)]">
                            {filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No contacts found. Try adding some!
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={contact.id}
                                        className={`hover:bg-white/[0.02] transition-colors group cursor-pointer ${activeMenuId === contact.id ? 'relative z-50' : 'relative z-0'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{contact.name || "Unknown"}</div>
                                            <div className="text-sm text-zinc-400 mt-0.5">{contact.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 flex-wrap">
                                                {(contact.tags || []).map(tag => (
                                                    <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${contact.status === 'subscribed' ? 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                                }`}>
                                                {contact.status === 'subscribed' && <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]"></span>}
                                                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-400">
                                            {new Date(contact.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className={`px-6 py-4 text-right relative ${activeMenuId === contact.id ? 'z-50' : 'z-0'}`}>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    e.nativeEvent.stopImmediatePropagation();
                                                    setActiveMenuId(activeMenuId === contact.id ? null : contact.id);
                                                }}
                                                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>

                                            <AnimatePresence>
                                                {activeMenuId === contact.id && (
                                                    <motion.div
                                                        key="action-menu"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="absolute right-8 top-10 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 py-1 min-w-[120px]"
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingContact(contact);
                                                                setActiveMenuId(null);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                                        >
                                                            <Edit2 className="h-4 w-4" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuId(null);
                                                                handleDelete(contact.id);
                                                            }}
                                                            disabled={deletingId === contact.id}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Delete
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
