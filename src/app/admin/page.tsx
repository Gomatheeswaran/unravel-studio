import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, ShoppingBag, List, Users } from "lucide-react";

export default async function AdminDashboard() {
  const [productCount, orderCount, purchaseCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.purchase.count(),
    prisma.user.count({ where: { role: "user" } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { package: true, user: { select: { name: true, email: true } } },
  });

  const stats = [
    { label: "Products", value: productCount, icon: Package, href: "/admin/products", color: "text-purple-400" },
    { label: "Service Orders", value: orderCount, icon: List, href: "/admin/orders", color: "text-blue-400" },
    { label: "Product Sales", value: purchaseCount, icon: ShoppingBag, href: "/admin/purchases", color: "text-amber-400" },
    { label: "Users", value: userCount, icon: Users, href: "/admin", color: "text-green-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="bg-[#13131a] border border-[#2a2a3a] hover:border-purple-500/50 rounded-xl p-5 transition-all card-hover">
            <Icon size={24} className={`${color} mb-3`} />
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Service Orders</h2>
          <Link href="/admin/orders" className="text-sm text-purple-400 hover:text-purple-300">View all</Link>
        </div>
        <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                {["Customer", "Package", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">No orders yet</td></tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#1a1a24] transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{order.user.name ?? order.user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{order.package.name}</td>
                  <td className="px-4 py-3 text-sm text-white">${order.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
