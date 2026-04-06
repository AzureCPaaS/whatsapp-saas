"use client";

import { useState, useEffect, useRef } from "react";
import { getMessages, sendReply, getConversations } from "@/app/actions/inbox";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Loader2, MessageCircle, ChevronLeft } from "lucide-react";
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

export default function InboxClient({ initialConversations, initialContact }: { initialConversations: Message[], initialContact?: string }) {
    const [conversations, setConversations] = useState<Message[]>(initialConversations);
    const [activeContact, setActiveContact] = useState<string | null>(initialContact || null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingChat, setIsLoadingChat] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        if (initialContact) {
            setActiveContact(initialContact);
        }
    }, [initialContact]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        let isMounted = true;
        async function loadChat() {
            if (!activeContact) return;
            setIsLoadingChat(true);
            try {
                const history = await getMessages(activeContact);
                if (isMounted) setMessages(history as Message[]);
            } catch (error) {
                toast.error("Failed to load chat history");
            } finally {
                if (isMounted) setIsLoadingChat(false);
            }
        }
        loadChat();
        return () => { isMounted = false; };
    }, [activeContact]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const latestConversations = await getConversations();
                setConversations(latestConversations as Message[]);
                if (activeContact) {
                    const latestMessages = await getMessages(activeContact);
                    setMessages(latestMessages as Message[]);
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activeContact]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !activeContact || isSending) return;
        setIsSending(true);
        const textToSend = replyText;
        setReplyText("");
        try {
            await sendReply(activeContact, textToSend);
            const history = await getMessages(activeContact);
            setMessages(history as Message[]);
        } catch (error: any) {
            toast.error(error.message || "Failed to send message");
            setReplyText(textToSend);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="glass-panel flex-1 rounded-2xl overflow-hidden flex border border-white/10 shadow-2xl min-w-0 w-full h-full">
            {/* Left Sidebar: Conversations List */}
            <div className={`${activeContact ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] lg:w-[380px] shrink-0 border-r border-white/10 flex-col bg-black/20 h-full`}>
                <div className="p-4 border-b border-white/10 bg-black/20 shrink-0">
                    <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Active Chats</h2>
                </div>

                <div className="flex-1 overflow-y-auto w-full min-w-0">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-500">
                            <MessageCircle className="h-8 w-8 mb-3 opacity-30" />
                            <p className="text-sm">No conversations</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.contactPhone}
                                onClick={() => setActiveContact(conv.contactPhone)}
                                className={`w-full text-left p-4 hover:bg-white/10 transition-all duration-200 flex items-center gap-4 border-b border-white/5 ${activeContact === conv.contactPhone ? "bg-white/10 border-l-2 border-l-[#25D366]" : ""}`}
                            >
                                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex shrink-0 items-center justify-center border border-white/5 shadow-inner">
                                    <User className="h-5 w-5 text-zinc-400" />
                                </div>
                                <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="text-white font-medium text-sm truncate pr-2">{conv.contactPhone}</h3>
                                        <span className="text-[10px] text-zinc-500 shrink-0">
                                            {new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 truncate w-full">
                                        <span className={conv.direction === "outbound" ? "text-emerald-400" : "text-[#25D366]"}>
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
            <div className={`${!activeContact ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-black/40 relative w-full h-full min-w-0 overflow-hidden`}>
                {!activeContact ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 bg-black/20 h-full">
                        <MessageCircle className="h-16 w-16 mb-6 opacity-30" />
                        <h2 className="text-2xl font-light text-white/60 mb-2">Select a Conversation</h2>
                        <p className="text-sm text-zinc-500">Choose a chat from the left sidebar to begin messaging.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white/5 border-b border-white/10 backdrop-blur-md flex items-center gap-3 relative z-10 shrink-0 w-full min-w-0 shadow-sm">
                            <button
                                onClick={() => setActiveContact(null)}
                                className="md:hidden h-10 w-10 flex shrink-0 items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors -ml-2 mr-1"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div className="min-w-0 flex-1 ml-1">
                                <h3 className="text-white font-medium text-base truncate">{activeContact}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] animate-pulse shadow-[0_0_8px_#25d366]"></span>
                                    <p className="text-[11px] text-zinc-400 tracking-wide uppercase font-medium">WhatsApp Connected</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:px-8 md:py-6 space-y-4 relative min-w-0 w-full h-full">
                            {/* WhatsApp Pattern Background with subtle opacity */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                                style={{
                                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
                                    backgroundSize: "24px 24px"
                                }}
                            />

                            <div className="relative z-10 flex flex-col space-y-3 lg:space-y-4 h-full min-h-full">
                                {isLoadingChat ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="h-8 w-8 text-[#25D366] animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-zinc-400 py-10 text-sm glass-panel max-w-sm mx-auto rounded-2xl p-4 border border-white/5">No messages yet. Reply below contextually!</div>
                                ) : (
                                    <AnimatePresence initial={false}>
                                        {messages.map((msg, i) => {
                                            const isMe = msg.direction === "outbound";
                                            const showTime = i === 0 || new Date(msg.createdAt).getTime() - new Date(messages[i - 1].createdAt).getTime() > 1000 * 60 * 60;

                                            return (
                                                <div key={msg.id || i} className="flex flex-col w-full min-w-0">
                                                    {showTime && (
                                                        <div className="flex justify-center mb-5 mt-4">
                                                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5 shadow-sm backdrop-blur-md">
                                                                {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`w-fit max-w-[85%] md:max-w-[75%] flex flex-col min-w-0 ${isMe ? "self-end" : "self-start"}`}
                                                    >
                                                        <div
                                                            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                                                            className={`px-4 py-2.5 rounded-2xl shadow-lg leading-relaxed text-[15px] border ${isMe
                                                                ? "bg-gradient-to-br from-emerald-600/90 to-emerald-700/90 text-white rounded-tr-sm border-emerald-500/20 backdrop-blur-md"
                                                                : "bg-white/10 text-zinc-100 rounded-tl-sm border-white/10 backdrop-blur-xl"
                                                                }`}
                                                        >
                                                            <div className="whitespace-pre-wrap text-sm md:text-[15px] drop-shadow-sm">{msg.content || <i className="opacity-70">[Media/Template]</i>}</div>
                                                            <div className="flex justify-end items-center mt-1 gap-1.5 float-right ml-4">
                                                                <span className="text-[10px] text-white/50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                                <div ref={messagesEndRef} className="h-1 shrink-0" />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-2xl flex items-center gap-3 shrink-0 relative z-20 w-full min-w-0">
                            <form onSubmit={handleSend} className="w-full flex gap-3 relative items-center min-w-0">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:border-transparent transition-all placeholder:text-zinc-500 min-w-0 shadow-inner"
                                    disabled={isSending}
                                />
                                <button
                                    type="submit"
                                    disabled={isSending || !replyText.trim()}
                                    className="shrink-0 h-11 w-11 rounded-full flex items-center justify-center bg-[#25D366] text-black hover:bg-[#20bd5a] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-[#25D366]/20"
                                >
                                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
