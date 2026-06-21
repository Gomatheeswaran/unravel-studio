"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">Delete?</span>
        <button onClick={handleDelete} disabled={loading} className="text-xs text-red-400 hover:text-red-300 font-medium">Yes</button>
        <button onClick={() => setConfirming(false)} className="text-xs text-gray-400 hover:text-white">No</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Delete ${productName}`}
      className="text-gray-400 hover:text-red-400 transition-colors"
    >
      <Trash2 size={16} />
    </button>
  );
}
