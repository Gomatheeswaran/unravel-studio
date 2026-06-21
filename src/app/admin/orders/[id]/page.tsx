import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      package: true,
      user: { select: { name: true, email: true } },
      referenceFiles: true,
    },
  });

  if (!order) notFound();

  const projectDetails = JSON.parse(order.projectDetails || "{}") as Record<string, string>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-2">Order Details</h1>
      <p className="text-gray-500 text-sm mb-8 font-mono">{order.id}</p>

      <div className="grid gap-6">
        {/* Customer & Package */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5">
            <h3 className="text-xs text-gray-400 uppercase font-semibold mb-3">Customer</h3>
            <p className="text-white font-medium">{order.user.name ?? "—"}</p>
            <p className="text-gray-400 text-sm">{order.user.email}</p>
          </div>
          <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5">
            <h3 className="text-xs text-gray-400 uppercase font-semibold mb-3">Package</h3>
            <p className="text-white font-medium">{order.package.name}</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5">
          <h3 className="text-xs text-gray-400 uppercase font-semibold mb-4">Project Details</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(projectDetails).filter(([, v]) => v).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                <p className="text-sm text-white mt-0.5">{value as string}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reference Files */}
        {order.referenceFiles.length > 0 && (
          <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5">
            <h3 className="text-xs text-gray-400 uppercase font-semibold mb-4">Reference Files ({order.referenceFiles.length})</h3>
            <div className="space-y-2">
              {order.referenceFiles.map((f) => (
                <div key={f.id} className="flex items-center justify-between bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3">
                  <span className="text-sm text-white">{f.fileName}</span>
                  <a
                    href={`/api/upload/download?path=${encodeURIComponent(f.filePath)}`}
                    className="text-purple-400 hover:text-purple-300 text-xs transition-colors"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Management */}
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} adminNotes={order.adminNotes ?? ""} />
      </div>
    </div>
  );
}
