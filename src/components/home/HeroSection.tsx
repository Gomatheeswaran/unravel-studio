"use client";

import Link from "next/link";
import { ArrowRight, Layers, Brush, Box } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          3D Artist & Designer
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-white">Ram Kumar </span>
          <span className="gradient-text">Ragul</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Creating stunning 3D characters, environments, and assets. Available for commissions and collaborations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/products"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Browse Assets <ArrowRight size={16} />
          </Link>
          <Link
            href="/services"
            className="flex items-center gap-2 bg-[#1a1a24] hover:bg-[#2a2a3a] text-white px-6 py-3 rounded-lg text-sm font-medium border border-[#2a2a3a] hover:border-purple-500/50 transition-all"
          >
            Hire Me
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          {[
            { icon: Box, label: "3D Models", value: "50+" },
            { icon: Layers, label: "Asset Packs", value: "20+" },
            { icon: Brush, label: "Projects Done", value: "100+" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon size={24} className="text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
