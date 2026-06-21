"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Package } from "lucide-react";
import { formatFileSize, getFileIcon } from "@/lib/utils";

interface PurchasedProduct {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  files: Array<{ id: string; fileName: string; fileType: string; fileSize: number }>;
}

interface Purchase {
  id: string;
  createdAt: string;
  items: Array<{ productId: string; priceAtPurchase: number; product: PurchasedProduct }>;
}

export default function DownloadsPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders?type=purchases")
      .then((r) => r.json())
      .then((d) => { setPurchases(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const allProducts = purchases.flatMap((p) => p.items.map((i) => i.product)).filter(Boolean);
  const unique = Array.from(new Map(allProducts.map((p) => [p.id, p])).values());

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
        {[1, 2].map((i) => <div key={i} className="h-32 bg-[#13131a] rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-white mb-2">My Downloads</h1>
      <p className="text-gray-400 mb-8">Products you&apos;ve purchased</p>

      {unique.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="mb-4">No downloads yet.</p>
          <Link href="/products" className="text-purple-400 hover:text-purple-300 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {unique.map((product) => (
            <div key={product.id} className="bg-[#13131a] border border-[#2a2a3a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image src={product.thumbnail} alt={product.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1">
                  <Link href={`/products/${product.slug}`} className="font-medium text-white hover:text-purple-400 transition-colors">
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">{product.files.length} file(s)</p>
                </div>
              </div>

              {product.files.length > 0 && (
                <div className="border-t border-[#2a2a3a] divide-y divide-[#2a2a3a]">
                  {product.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span>{getFileIcon(file.fileType)}</span>
                        <div>
                          <p className="text-sm text-white">{file.fileName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)} · .{file.fileType}</p>
                        </div>
                      </div>
                      <a
                        href={`/api/products/${product.id}/download?fileId=${file.id}`}
                        className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Download size={16} /> Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
