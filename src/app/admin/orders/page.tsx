import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-purple-500/20 text-purple-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      package: true,
      user: { select: { name: true, email: true } },
      _count: { select: { referenceFiles: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Service Orders</h1>

      <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#2a2a3a]">
              {["Customer", "Package", "Amount", "Files", "Status", "Date", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a3a]">
            {orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No orders yet</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#1a1a24] transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm text-white">{order.user.name ?? "—"}</p>
                  <p className="text-xs text-gray-500">{order.user.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{order.package.name}</td>
                <td className="px-4 py-3 text-sm text-white">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{order._count.referenceFiles}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-500/20 text-gray-400"}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
