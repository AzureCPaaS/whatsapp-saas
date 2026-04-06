import { getRecentCampaigns, getAudienceContacts } from "@/app/actions/dashboard";
import { getGroupsAndCounts } from "@/app/actions/groups";
import BroadcastsClient from "./broadcasts-client";

export default async function BroadcastsPage() {
    const campaigns = await getRecentCampaigns();
    const audience = await getAudienceContacts();
    const groups = await getGroupsAndCounts();

    return <BroadcastsClient campaigns={campaigns} audienceCount={audience.length} segments={groups} />;
}
