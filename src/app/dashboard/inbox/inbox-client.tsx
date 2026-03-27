"use client";

import { useState, useEffect, useRef } from "react";
import { getMessages, sendReply, getConversations } from "@/app/actions/inbox";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Clock, Loader2, AlertCircle, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";

type Message = {
    id: string;
    contactPhone: string;
    direction: string;
    type: string;
    content: string | null;
    status: string;
    createdAt: Date;
};

export default function InboxClient({ initialConversations }: { initialConversations: Message[] }) {
    const [conversations, setConversations] = useState<Message[]>(initialConversations);
    const [activeContact, setActiveContact] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingChat, setIsLoadingChat] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch message history when a contact is selected
    useEffect(() => {
        let isMounted = true;

        async function loadChat() {
            if (!activeContact) return;
            setIsLoadingChat(true);
            try {
                const history = await getMessages(activeContact);
                if (isMounted) {
                    setMessages(history as Message[]);
                }
            } catch (error) {
                toast.error("Failed to load chat history");
            } finally {
                if (isMounted) setIsLoadingChat(false);
            }
        }

        loadChat();

        return () => { isMounted = false; };
    }, [activeContact]);

    // Polling mechanism to simulate real-time updates for new incoming webhooks
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // Refresh conversations list
                const latestConversations = await getConversations();
                setConversations(latestConversations as Message[]);

                // If looking at a specific chat, refresh that chat
                if (activeContact) {
                    const latestMessages = await getMessages(activeContact);
                    setMessages(latestMessages as Message[]);
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [activeContact]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !activeContact || isSending) return;

        setIsSending(true);
        const textToSend = replyText;
        setReplyText(""); // Optimistic clear

        try {
            await sendReply(activeContact, textToSend);
            // Refresh chat window immediately
            const history = await getMessages(activeContact);
            setMessages(history as Message[]);
        } catch (error: any) {
            toast.error(error.message || "Failed to send message");
            setReplyText(textToSend); // Restore text on failure
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="glass-panel flex-1 rounded-2xl overflow-hidden flex border border-white/10 shadow-2xl">
            {/* Left Sidebar: Conversations List */}
            <div className="w-1/3 min-w-[300px] border-r border-white/10 flex flex-col bg-black/20">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Active Chats</h2>
                </div>

                <div className="flex-1 overflow-y-auto w-full">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-500">
                            <AlertCircle className="h-8 w-8 mb-3 opacity-50" />
                            <p className="text-sm">No conversations yet.</p>
                            <p className="text-xs mt-1">When someone sends a message to your WhatsApp number, it will appear here.</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.contactPhone}
                                onClick={() => setActiveContact(conv.contactPhone)}
                                className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/10 transition-colors flex items-start gap-4 ${activeContact === conv.contactPhone ? "bg-white/10 border-l-2 border-l-[#25D366]" : ""
                                    }`}
                            >
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center shrink-0 border border-white/10">
                                    <User className="h-5 w-5 text-zinc-400" />
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-white font-medium text-sm truncate">{conv.contactPhone}</h3>
                                        <span className="text-[10px] text-zinc-500 shrink-0">
                                            {new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 truncate w-full">
                                        <span className={conv.direction === "outbound" ? "text-blue-400" : "text-[#25D366]"}>
                                            {conv.direction === "outbound" ? "You: " : ""}
                                        </span>
                                        {conv.content || "Template message"}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Pane: Chat History */}
            <div className="flex-1 flex flex-col bg-black/40 relative">
                {!activeContact ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border border-white/10">
                                <User className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">{activeContact}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                                    <span className="text-[10px] text-zinc-400 font-medium">WhatsApp Connected</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                            {isLoadingChat ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-zinc-500 py-10 text-sm">No messages found.</div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, i) => {
                                        const isMe = msg.direction === "outbound";
                                        // Simple heuristic to show times
                                        const showTime = i === 0 ||
                                            new Date(msg.createdAt).getTime() - new Date(messages[i - 1].createdAt).getTime() > 1000 * 60 * 5;

                                        return (
                                            <div key={msg.id || i} className="flex flex-col">
                                                {showTime && (
                                                    <div className="flex justify-center mb-4 mt-2 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                                                        {new Date(msg.createdAt).toLocaleString()}
                                                    </div>
                                                )}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    className={`max-w-[80%] flex ${isMe ? "self-end" : "self-start"}`}
                                                >
                                                    <div
                                                        className={`px-4 py-3 rounded-2xl ${isMe
                                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm shadow-md shadow-blue-900/20"
                                                            : "bg-white/10 border border-white/10 text-zinc-100 rounded-tl-sm backdrop-blur-sm"
                                                            }`}
                                                    >
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content || <i>[Media/Template]</i>}</p>

                                                        {isMe && (
                                                            <div className="flex justify-end mt-1.5">
                                                                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
                                                                    {msg.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            </div>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-xl">
                            <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 relative">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:border-transparent transition-all placeholder:text-zinc-600"
                                    disabled={isSending}
                                />
                                <button
                                    type="submit"
                                    disabled={isSending || !replyText.trim()}
                                    className="absolute right-2 top-2 bottom-2 bg-[#25D366] hover:bg-[#20bd5a] text-black rounded-full w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#25D366]/20"
                                >
                                    {isSending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4 ml-0.5" />
                                    )}
                                </button>
                            </form>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-zinc-500">Replies are sent instantly via Meta WhatsApp Cloud API.</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
