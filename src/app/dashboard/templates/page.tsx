import { getWhatsAppTemplates } from "@/app/actions/templates";
import TemplatesClient from "./templates-client";

export default async function TemplatesPage() {
    // Fetch all templates (approved, pending, rejected)
    const templates = await getWhatsAppTemplates("ALL");

    return <TemplatesClient initialTemplates={templates} />;
}
