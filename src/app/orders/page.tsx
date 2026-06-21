"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Package, Clock, CheckCircle, XCircle, Loader } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-400" },
  paid: { label: "Paid", icon: CheckCircle, color: "text-blue-400" },
  in_progress: { label: "In Progress", icon: Loader, color: "text-purple-400" },
  completed: { label: "Completed", icon: CheckCircle, color: "text-green-400" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-400" },
};

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  package: { name: string; tier: string };
  projectDetails: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => { setOrders(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-[#13131a] rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-white mb-8">My Service Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-4 text-gray-600" />
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const Icon = status.icon;
            const details = JSON.parse(order.projectDetails || "{}");

            return (
              <div key={order.id} className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-purple-400 uppercase font-semibold mb-1">{order.package.tier}</p>
                    <h3 className="font-semibold text-white">{order.package.name}</h3>
                    {details.projectType && (
                      <p className="text-sm text-gray-400 mt-1">{details.projectType}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-white">{formatPrice(order.totalAmount)}</p>
                    <div className={`flex items-center gap-1 justify-end mt-2 ${status.color}`}>
                      <Icon size={14} />
                      <span className="text-xs font-medium">{status.label}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 font-mono">ID: {order.id}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
