"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

const STATUSES = ["pending", "paid", "in_progress", "completed", "cancelled"];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  adminNotes,
}: {
  orderId: string;
  currentStatus: string;
  adminNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(adminNotes);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  return (
    <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-5">
      <h3 className="text-xs text-gray-400 uppercase font-semibold mb-4">Update Status</h3>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === s ? "bg-purple-600 text-white" : "bg-[#2a2a3a] text-gray-400 hover:text-white"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
        <Textarea
          label="Admin Notes"
          id="notes"
          placeholder="Internal notes about this order..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button onClick={handleSave} loading={loading}>
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
