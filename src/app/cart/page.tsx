"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    price: number;
  };
}

export default function CartPage() {
  const { refreshCart } = useCart();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadCart = async () => {
    setLoading(true);
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { loadCart(); }, []);

  const removeItem = async (productId: string) => {
    await fetch(`/api/cart/${productId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    refreshCart();
  };

  const handleCheckout = async () => {
    setChecking(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    setChecking(false);
    if (data.purchaseId) {
      setItems([]);
      refreshCart();
      setSuccess(true);
    }
  };

  const total = items.reduce((sum, item) => sum + item.product.price, 0);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-[#13131a] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Purchase Successful!</h2>
        <p className="text-gray-400 mb-6">Your products are now available for download.</p>
        <Link href="/downloads" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 transition-colors">
          Go to Downloads <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <ShoppingCart size={24} className="text-purple-400" />
        Shopping Cart ({items.length})
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
          <Link href="/products" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 transition-colors">
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-[#13131a] border border-[#2a2a3a] rounded-xl p-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                  <Image src={item.product.thumbnail} alt={item.product.name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} className="font-medium text-white hover:text-purple-400 transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-purple-400 font-semibold mt-1">{formatPrice(item.product.price)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-gray-400 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="md:col-span-1">
            <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5 sticky top-24">
              <h3 className="font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <div className="h-px bg-[#2a2a3a] mb-4" />
              <div className="flex justify-between font-bold text-white mb-6">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button onClick={handleCheckout} loading={checking} size="lg" className="w-full">
                Checkout
              </Button>
              <Link href="/products" className="block text-center text-sm text-gray-400 hover:text-white mt-4 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
