"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Download } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  isFree: boolean;
  thumbnail: string;
  category?: string | null;
}

export function ProductCard({ product }: { product: Product }) {
  const { data: session } = useSession();
  const { refreshCart } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session?.user) { router.push("/login"); return; }
    setAdding(true);
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    refreshCart();
    setAdding(false);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl overflow-hidden card-hover hover:border-purple-500/50 transition-all">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={product.isFree ? "free" : "paid"}>
              {product.isFree ? "Free" : formatPrice(product.price)}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-white text-sm line-clamp-1">{product.name}</h3>
          {product.category && (
            <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {product.isFree ? "Free" : formatPrice(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
              title={product.isFree ? "Download" : "Add to cart"}
            >
              {product.isFree ? <Download size={14} /> : <ShoppingCart size={14} />}
              {product.isFree ? "Download" : adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
