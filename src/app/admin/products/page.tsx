import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { _count: { select: { files: true, purchaseItems: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a3a]">
              {["Product", "Type", "Price", "Files", "Sales", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a3a]">
            {products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No products yet. <Link href="/admin/products/new" className="text-purple-400">Add one</Link></td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="hover:bg-[#1a1a24] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#2a2a3a]">
                      {p.thumbnail && (
                        <Image src={p.thumbnail} alt={p.name} fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                    <span className="text-sm text-white font-medium line-clamp-1">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${p.isFree ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {p.isFree ? "Free" : "Paid"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-white">{p.isFree ? "Free" : formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{p._count.files}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{p._count.purchaseItems}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${p.id}`} className="text-gray-400 hover:text-purple-400 transition-colors">
                      <Edit size={16} />
                    </Link>
                    <DeleteProductButton productId={p.id} productName={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
