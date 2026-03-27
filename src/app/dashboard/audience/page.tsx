import { getAudienceContacts } from "@/app/actions/dashboard";
import AudienceClient from "./audience-client";

export default async function AudiencePage() {
    const contacts = await getAudienceContacts();

    return <AudienceClient contacts={contacts} />;
}
