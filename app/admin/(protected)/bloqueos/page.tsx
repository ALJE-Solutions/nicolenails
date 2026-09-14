import { BlockedSlotsManager } from "@/components/admin/BlockedSlotsManager";
import { getBlockedSlots } from "@/lib/admin/queries";

export default async function BloqueosPage() {
  const slots = await getBlockedSlots();
  return <BlockedSlotsManager slots={slots} />;
}
