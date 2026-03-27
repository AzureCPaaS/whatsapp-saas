import { getDashboardStats, getRecentCampaigns } from "@/app/actions/dashboard";
import DashboardOverviewClient from "./overview-client";

export default async function DashboardOverview() {
    const rawStats = await getDashboardStats();
    const campaigns = await getRecentCampaigns();

    const stats: { name: string; value: string; change: string; icon: "MessageCircle" | "Users" | "CheckCircle2" | "CreditCard"; trend: string }[] = [
        { name: "Messages Sent", value: rawStats.messagesSent, change: "+12.5%", icon: "MessageCircle", trend: "up" },
        { name: "Total Audience", value: rawStats.totalAudience, change: "+4.2%", icon: "Users", trend: "up" },
        { name: "Delivery Rate", value: rawStats.deliveryRate, change: "+0.1%", icon: "CheckCircle2", trend: "up" },
        { name: "Current Spend", value: rawStats.currentSpend, change: "-2.4%", icon: "CreditCard", trend: "down" },
    ];

    return <DashboardOverviewClient stats={stats} campaigns={campaigns} />;
}
