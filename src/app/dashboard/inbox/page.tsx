import { getConversations } from "@/app/actions/inbox";
import InboxClient from "./inbox-client";

export default async function InboxPage(props: { searchParams?: any }) {
    const searchParams = props.searchParams ? await props.searchParams : {};
    const initialContact = searchParams.contact as string | undefined;

    const conversations = await getConversations();

    return (
        <div className="h-[calc(100vh-8rem)] min-h-[600px] flex flex-col pt-6 min-w-0">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold text-white tracking-tight">Live Inbox</h1>
                <p className="text-zinc-400 mt-1">Chat directly with your WhatsApp audience in real-time.</p>
            </div>

            <InboxClient initialConversations={conversations} initialContact={initialContact} />
        </div>
    );
}
