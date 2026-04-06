"use client";

import { useState } from "react";
import { Users, Plus, Trash2, Edit2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createGroup, deleteGroup, updateGroup } from "@/app/actions/groups";
import { useRouter } from "next/navigation";

type Group = {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    count: number;
};

export default function GroupsClient({ initialGroups }: { initialGroups: Group[] }) {
    const [groups, setGroups] = useState<Group[]>(initialGroups || []);
    const [searchQuery, setSearchQuery] = useState("");
    const [isPending, setIsPending] = useState(false);

    // Modals
    const [isCreating, setIsCreating] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);

    const router = useRouter();

    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    async function handleCreate(formData: FormData) {
        setIsPending(true);
        const res = await createGroup(formData);
        if (res.success) {
            setIsCreating(false);
            router.refresh(); // Relying on nextjs cache refresh to update initialGroups
        } else {
            alert(res.error);
        }
        setIsPending(false);
    }

    async function handleUpdate(formData: FormData) {
        if (!editingGroup) return;
        setIsPending(true);
        const res = await updateGroup(editingGroup.id, formData);
        if (res.success) {
            setEditingGroup(null);
            router.refresh();
        } else {
            alert(res.error);
        }
        setIsPending(false);
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Are you sure you want to delete the group "${name}"? Contacts within it will NOT be deleted.`)) return;
        setIsPending(true);
        const res = await deleteGroup(id);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error);
        }
        setIsPending(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Groups</h1>
                    <p className="text-zinc-400 mt-1">Organize your audience into distinct targetable sections.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-[#25D366] text-black hover:bg-[#128C7E] hover:text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    <Plus className="h-5 w-5" />
                    New Group
                </button>
            </div>

            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-panel p-6 rounded-2xl border border-[#25D366]/30 mb-6 relative mt-2">
                            <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-white mb-4">Create New Group</h2>
                            <form action={handleCreate} className="flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm text-zinc-400 mb-1">Group Name <span className="text-rose-500">*</span></label>
                                    <input name="name" required placeholder="e.g. VIP Customers" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-[#25D366]" />
                                </div>
                                <div className="flex-1 min-w-[250px]">
                                    <label className="block text-sm text-zinc-400 mb-1">Description (Optional)</label>
                                    <input name="description" placeholder="Short internal note" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-[#25D366]" />
                                </div>
                                <button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-xl bg-[#25D366] text-black font-semibold hover:bg-[#128C7E] hover:text-white transition-colors disabled:opacity-50">
                                    {isPending ? "Saving..." : "Create"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {editingGroup && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 mb-6 relative mt-2">
                            <button onClick={() => setEditingGroup(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-white mb-4">Editing Group: {editingGroup.name}</h2>
                            <form action={handleUpdate} className="flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm text-zinc-400 mb-1">Group Name</label>
                                    <input name="name" required defaultValue={editingGroup.name} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                <button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50">
                                    {isPending ? "Updating..." : "Update"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="glass-panel rounded-2xl flex-1 overflow-visible min-h-[400px] flex flex-col">
                <div className="p-4 border-b border-[var(--color-glass-border)] flex items-center justify-between">
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-2 w-full max-w-sm focus-within:ring-1 focus-within:ring-[#25D366]/50 transition-all">
                        <Search className="h-4 w-4 text-zinc-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600 w-full"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1 pb-24">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-[var(--color-glass-border)] text-xs uppercase tracking-wider text-zinc-500 bg-black/20">
                                <th className="px-6 py-4 font-medium">Group Name</th>
                                <th className="px-6 py-4 font-medium">Description</th>
                                <th className="px-6 py-4 font-medium text-center">Contacts</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-glass-border)]">
                            {filteredGroups.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        No groups found. Create one above!
                                    </td>
                                </tr>
                            ) : (
                                filteredGroups.map(group => (
                                    <tr key={group.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-indigo-400" />
                                                </div>
                                                <span className="font-medium text-white">{group.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-400">
                                            {group.description || <span className="italic opacity-50">No description</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20">
                                                {group.count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingGroup(group)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Edit">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(group.id, group.name)} className="p-2 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400 transition-colors" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
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
