import { prisma } from "@/lib/prisma";
import { ServicePackageEditor } from "@/components/admin/ServicePackageEditor";

export default async function AdminServicesPage() {
  const packages = await prisma.servicePackage.findMany({ orderBy: { price: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Service Packages</h1>
      <p className="text-gray-400 text-sm mb-8">Edit the Basic, Standard, and Premium service packages.</p>
      <div className="grid gap-6 max-w-3xl">
        {packages.map((pkg) => (
          <ServicePackageEditor key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </div>
  );
}
