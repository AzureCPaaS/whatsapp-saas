import { getGroupsAndCounts } from "@/app/actions/groups";
import GroupsClient from "./groups-client";

export default async function GroupsPage() {
    const groups = await getGroupsAndCounts();

    return <GroupsClient initialGroups={groups} />;
}
