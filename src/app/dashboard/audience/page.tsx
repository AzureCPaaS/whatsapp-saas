import { getAudienceContacts } from "@/app/actions/dashboard";
import { getGroupsAndCounts } from "@/app/actions/groups";
import AudienceClient from "./audience-client";

export default async function AudiencePage() {
    const contacts = await getAudienceContacts();
    const groups = await getGroupsAndCounts();

    return <AudienceClient contacts={contacts} groups={groups} />;
}
