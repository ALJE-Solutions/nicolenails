import { StaffList } from "@/components/admin/StaffList";
import { getAllStaff } from "@/lib/admin/queries";

export default async function PersonalPage() {
  const staff = await getAllStaff();

  return <StaffList staff={staff} />;
}
