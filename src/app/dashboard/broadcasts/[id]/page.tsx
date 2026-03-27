import { getCampaignDetails, getCampaignMetrics, getCampaignRecipients } from "@/app/actions/campaigns";
import CampaignDetailClient from "./campaign-detail-client";
import { notFound } from "next/navigation";

export default async function CampaignDetailPage(props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const campaign = await getCampaignDetails(params.id);
        const metrics = await getCampaignMetrics(params.id);
        const recipients = await getCampaignRecipients(params.id);


        return (
            <CampaignDetailClient
                campaign={campaign}
                metrics={metrics}
                recipients={recipients}
            />
        );
    } catch (e) {
        return notFound();
    }
}
