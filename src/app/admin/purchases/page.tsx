import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminPurchasesPage() {
  const purchases = await prisma.purchase.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Product Orders</h1>

      <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-[#2a2a3a]">
              {["Customer", "Products", "Total", "Date"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a3a]">
            {purchases.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500">No purchases yet</td></tr>
            ) : purchases.map((p) => (
              <tr key={p.id} className="hover:bg-[#1a1a24] transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm text-white">{p.user.name ?? "—"}</p>
                  <p className="text-xs text-gray-500">{p.user.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {p.items.map((i) => i.product.name).join(", ")}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-white">{formatPrice(p.totalAmount)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
