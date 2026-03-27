import { getRecentCampaigns, getAudienceContacts } from "@/app/actions/dashboard";
import BroadcastsClient from "./broadcasts-client";

export default async function BroadcastsPage() {
    const campaigns = await getRecentCampaigns();
    const audience = await getAudienceContacts();

    return <BroadcastsClient campaigns={campaigns} audienceCount={audience.length} />;
}
