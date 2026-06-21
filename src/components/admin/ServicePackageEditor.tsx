"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, X } from "lucide-react";

interface ServicePackage {
  id: string;
  tier: string;
  name: string;
  price: number;
  description: string;
  workCoverage: string;
  deliveryDays: number;
  revisions: number;
}

export function ServicePackageEditor({ pkg }: { pkg: ServicePackage }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: pkg.name,
    price: pkg.price.toString(),
    description: pkg.description,
    deliveryDays: pkg.deliveryDays.toString(),
    revisions: pkg.revisions.toString(),
  });
  const [coverage, setCoverage] = useState<string[]>(
    JSON.parse(pkg.workCoverage || "[]") as string[]
  );
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const addCoverageItem = () => {
    if (newItem.trim()) { setCoverage((prev) => [...prev, newItem.trim()]); setNewItem(""); }
  };

  const handleSave = async () => {
    setLoading(true);
    await fetch(`/api/services/${pkg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        deliveryDays: parseInt(form.deliveryDays),
        revisions: parseInt(form.revisions),
        workCoverage: coverage,
      }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const TIER_COLORS: Record<string, string> = {
    basic: "border-blue-500/30",
    standard: "border-purple-500/50",
    premium: "border-amber-500/30",
  };

  return (
    <div className={`bg-[#13131a] border-2 ${TIER_COLORS[pkg.tier] ?? "border-[#2a2a3a]"} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{pkg.tier}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Input label="Package Name" id={`name-${pkg.id}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Price (USD)" id={`price-${pkg.id}`} type="number" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Input label="Delivery Days" id={`days-${pkg.id}`} type="number" value={form.deliveryDays} onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })} />
        <Input label="Revisions (99 = unlimited)" id={`rev-${pkg.id}`} type="number" value={form.revisions} onChange={(e) => setForm({ ...form, revisions: e.target.value })} />
      </div>

      <Textarea label="Description" id={`desc-${pkg.id}`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mb-4" />

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-300 block mb-1.5">Work Coverage</label>
        <div className="space-y-1 mb-2">
          {coverage.map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2">
              <span className="text-sm text-gray-300">{item}</span>
              <button type="button" onClick={() => setCoverage((prev) => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-400">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input id={`new-${pkg.id}`} placeholder="Add coverage item..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCoverageItem(); } }} />
          <Button type="button" variant="secondary" onClick={addCoverageItem} size="sm"><Plus size={16} /></Button>
        </div>
      </div>

      <Button onClick={handleSave} loading={loading}>
        {saved ? "Saved!" : "Save Package"}
      </Button>
    </div>
  );
}
