"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Clock, RefreshCw, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

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

const TIER_COLORS: Record<string, { border: string; badge: string; button: string }> = {
  basic: {
    border: "border-[#2a2a3a] hover:border-blue-500/50",
    badge: "bg-blue-500/20 text-blue-400",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  standard: {
    border: "border-purple-500/50 hover:border-purple-400",
    badge: "bg-purple-500/20 text-purple-400",
    button: "bg-purple-600 hover:bg-purple-700",
  },
  premium: {
    border: "border-amber-500/50 hover:border-amber-400",
    badge: "bg-amber-500/20 text-amber-400",
    button: "bg-amber-600 hover:bg-amber-700",
  },
};

export default function ServicesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => { setPackages(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setPackages([]); setLoading(false); });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Services & Packages</h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          Professional 3D art services tailored to your needs. From simple props to full production pipelines.
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#13131a] border border-[#2a2a3a] rounded-2xl p-6 animate-pulse space-y-4">
              <div className="h-4 bg-[#2a2a3a] rounded w-1/3" />
              <div className="h-8 bg-[#2a2a3a] rounded" />
              <div className="h-4 bg-[#2a2a3a] rounded" />
              <div className="h-4 bg-[#2a2a3a] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No service packages available.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const colors = TIER_COLORS[pkg.tier] ?? TIER_COLORS.basic;
            const coverage = JSON.parse(pkg.workCoverage || "[]") as string[];

            return (
              <div
                key={pkg.id}
                className={`relative bg-[#13131a] border-2 ${colors.border} rounded-2xl p-6 flex flex-col transition-all ${
                  pkg.tier === "standard" ? "scale-[1.02] shadow-2xl shadow-purple-500/20" : ""
                }`}
              >
                {pkg.tier === "standard" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.badge} self-start mb-4`}>
                  {pkg.tier.toUpperCase()}
                </div>

                <h2 className="text-xl font-bold text-white mb-2">{pkg.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>

                <div className="text-3xl font-bold text-white mb-2">
                  {formatPrice(pkg.price)}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {pkg.deliveryDays} days
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCw size={14} /> {pkg.revisions >= 99 ? "Unlimited" : pkg.revisions} revisions
                  </span>
                </div>

                <div className="space-y-2 mb-8 flex-1">
                  {coverage.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/services/order/${pkg.id}`}
                  className={`flex items-center justify-center gap-2 ${colors.button} text-white py-3 px-6 rounded-xl font-medium transition-colors`}
                >
                  Get Started <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-16 bg-[#13131a] border border-[#2a2a3a] rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Need something custom?</h3>
        <p className="text-gray-400 mb-4">
          Have a unique project? Contact me directly and we&apos;ll figure out the best approach.
        </p>
        <a
          href="https://www.artstation.com/ramkumarragul"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          Message on ArtStation <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
