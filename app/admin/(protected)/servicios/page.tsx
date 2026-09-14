import { ServiceList } from "@/components/admin/ServiceList";
import { getAllServices } from "@/lib/admin/queries";

export default async function ServiciosAdminPage() {
  const services = await getAllServices();
  return <ServiceList services={services} />;
}
